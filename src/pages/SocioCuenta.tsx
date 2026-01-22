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
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardBody,
  Icon,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import {
  FiUser,
  FiCreditCard,
  FiAlertTriangle,
  FiDollarSign,
  FiArrowLeft,
} from "react-icons/fi";

/* =====================
   INTERFACES
===================== */
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
        if (isMounted.current) setData(res.data);
      } catch {
        toast({ title: "Error al cargar la cuenta", status: "error" });
      } finally {
        if (isMounted.current) setLoading(false);
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

      toast({ title: "Multa pagada", status: "success" });

      const res = await api.get(`/socios/${cedula}/cuenta`);
      if (isMounted.current) setData(res.data);
    } catch {
      toast({ title: "Error al pagar multa", status: "error" });
    } finally {
      setPayingId(null);
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
    <Box maxW="1200px" mx="auto" p={8}>
      {/* Header */}
      <HStack mb={6} spacing={4}>
        <Button
          leftIcon={<FiArrowLeft />}
          size="sm"
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
        <Heading size="lg">Cuenta del Socio</Heading>
      </HStack>

      {/* Cards principales */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>
                <HStack>
                  <Icon as={FiUser} />
                  <Text>Socio</Text>
                </HStack>
              </StatLabel>
              <StatNumber fontSize="md">{data.nombre}</StatNumber>
              <Text fontSize="sm" color="gray.500">
                {data.cedula}
              </Text>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>
                <HStack>
                  <Icon as={FiDollarSign} />
                  <Text>Capital</Text>
                </HStack>
              </StatLabel>
              <StatNumber>${data.capital.toFixed(2)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>
                <HStack>
                  <Icon as={FiAlertTriangle} />
                  <Text>Total Multas</Text>
                </HStack>
              </StatLabel>
              <StatNumber>${data.totalMultas.toFixed(2)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Estado</StatLabel>
              <Badge
                mt={2}
                colorScheme={data.estadoCuenta === "AL_DIA" ? "green" : "red"}
                fontSize="0.9em"
                px={3}
                py={1}
                borderRadius="md"
                width="fit-content"
              >
                {data.estadoCuenta === "AL_DIA"
                  ? "AL DÍA"
                  : "TIENE DEUDAS"}
              </Badge>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Multas */}
      <Card>
        <CardBody>
          <Heading size="md" mb={4}>
            Multas
          </Heading>

          {data.multas.length === 0 && (
            <Text color="gray.500">No tiene multas registradas</Text>
          )}

          <Stack spacing={4}>
            {data.multas.map((m) => (
              <HStack
                key={m.id}
                justify="space-between"
                p={3}
                borderWidth="1px"
                borderRadius="md"
              >
                <HStack>
                  <Icon as={FiCreditCard} color="orange.400" />
                  <Text>
                    Multa #{m.id} — ${m.valor.toFixed(2)}
                  </Text>
                </HStack>

                <Button
                  size="sm"
                  colorScheme={m.pagada ? "green" : "teal"}
                  isDisabled={m.pagada}
                  onClick={() => payMulta(m.id)}
                >
                  {m.pagada ? "Pagada" : "Pagar"}
                </Button>
              </HStack>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Box>
  );
}
