import {
  Box,
  Heading,
  Text,
  Spinner,
  Stack,
  Badge,
  Divider,
  Button,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";

interface Credito {
  id: number;
  saldo: number;
}

interface Multa {
  id: number;
  valor: number;
  pagada: boolean;
}

interface SocioCuentaData {
  cedula: string;
  nombre: string;
  capital: number;
  creditos: Credito[];
  multas: Multa[];
  totalMultas: number;
  estadoCuenta: "AL_DIA" | "DEUDA";
}

export default function SocioCuenta() {
  const { cedula } = useParams<{ cedula: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [data, setData] = useState<SocioCuentaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const loadData = async () => {
      if (!cedula) return;

      try {
        setLoading(true);
        const res = await api.get(`/socios/${cedula}/cuenta`);

        if (isMounted.current) {
          setData(res.data);
        }
      } catch {
        if (isMounted.current) {
          toast({
            title: "Error al cargar la cuenta",
            status: "error",
          });
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted.current = false;
    };
  }, [cedula, toast]);

  const payMulta = async (id: number) => {
    if (!data || !cedula) return;

    try {
      setPayingId(id);

      const multa = data.multas.find((m) => m.id === id);
      if (!multa || multa.pagada) return;

      await api.post("/multas/pagar", {
        attendanceId: id,
        socioId: cedula,
        monto: multa.valor,
      });

      if (isMounted.current) {
        toast({ title: "Multa pagada", status: "success" });
        setTimeout(async () => {
          const res = await api.get(`/socios/${cedula}/cuenta`);
          if (isMounted.current) setData(res.data);
        }, 400); // Retraso aumentado para evitar conflictos
      }
    } catch {
      if (isMounted.current) {
        toast({ title: "Error al pagar la multa", status: "error" });
      }
    } finally {
      if (isMounted.current) {
        setPayingId(null);
      }
    }
  };

  if (loading) {
    return (
      <Box p={10} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!data) {
    return <Text p={10}>No se pudo cargar la cuenta</Text>;
  }

  return (
    <Box maxW="900px" mx="auto" p={8}>
      <Button mb={4} size="sm" onClick={() => navigate(-1)}>
        Volver
      </Button>

      <Heading mb={4}>Cuenta del Socio</Heading>

      <Stack spacing={3}>
        <Text>
          <b>Cédula:</b> {data.cedula}
        </Text>
        <Text>
          <b>Nombre:</b> {data.nombre}
        </Text>
        <Text>
          <b>Capital:</b> ${data.capital.toFixed(2)}
        </Text>
        <Text>
          <b>Total Multas:</b> ${data.totalMultas.toFixed(2)}
        </Text>

        <Divider />

        <Text fontWeight="bold">Multas</Text>

        {data.multas.length === 0 && (
          <Text color="gray.500">No tiene multas</Text>
        )}

        {data.multas.map((m) => {
          const isPagada = Boolean(m.pagada);

          return (
            <HStack key={m.id} spacing={4}>
              <Text>
                Multa #{m.id} – ${m.valor.toFixed(2)}
              </Text>

              <Button
                size="sm"
                colorScheme={isPagada ? "green" : "teal"}
                isDisabled={isPagada}
                // isLoading={payingId === m.id} // QUITADO temporalmente para evitar error
                onClick={() => payMulta(m.id)}
              >
                {isPagada ? "Pagada" : "Pagar"}
              </Button>
            </HStack>
          );
        })}

        <Divider />

        <Badge
          colorScheme={data.estadoCuenta === "AL_DIA" ? "green" : "red"}
          width="fit-content"
        >
          {data.estadoCuenta === "AL_DIA" ? "Al día" : "Tiene deudas"}
        </Badge>
      </Stack>
    </Box>
  );
}
