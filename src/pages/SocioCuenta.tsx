import {
  Box,
  Heading,
  Text,
  Spinner,
  Stack,
  Badge,
  
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
import { motion } from "framer-motion";

/* =====================
   INTERFACES
===================== */

interface Credito {
  id: number;
  monto: number;
  estado: string;
  fecha: string | null;
}

interface CreditoEspecial {
  id: number;
  monto: number;
  interes: number;
  total: number;
  fecha: string;
  pagado: boolean;
}

interface Multa {
  id: number;
  valor: number;
  pagada: boolean;
  fecha: string;
}

interface SocioCuentaData {
  cedula: string;
  nombre: string;
  capital: number;
  creditos: Credito[];
  creditosEspeciales: CreditoEspecial[];
  multas: Multa[];
  totalMultas: number;
  estadoCuenta: "AL_DIA" | "DEUDA";
}

/* =====================
   COMPONENT
===================== */

const MotionBox = motion(Box);

export default function SocioCuenta() {
  const { cedula } = useParams<{ cedula: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [data, setData] = useState<SocioCuentaData>({
    cedula: "",
    nombre: "",
    capital: 0,
    creditos: [],
    creditosEspeciales: [],
    multas: [],
    totalMultas: 0,
    estadoCuenta: "AL_DIA",
  });

  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);
  const isMounted = useRef(true);

  /* =====================
     LOAD DATA
  ===================== */

  useEffect(() => {
    isMounted.current = true;

    const loadData = async () => {
      if (!cedula) return;

      try {
        setLoading(true);
        const res = await api.get(`/socios/${cedula}/cuenta`);

        if (isMounted.current) {
          setData({
            ...res.data,
            creditos: res.data.creditos || [],
            creditosEspeciales: res.data.creditosEspeciales || [],
            multas: res.data.multas || [],
          });
        }
      } catch {
        toast({
          title: "Error al cargar la cuenta",
          status: "error",
        });
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted.current = false;
    };
  }, [cedula, toast]);

  /* =====================
     PAGAR MULTA
  ===================== */

  const payMulta = async (id: number) => {
    if (!cedula) return;

    try {
      setPayingId(id);

      const multa = data.multas.find((m) => m.id === id);
      if (!multa || multa.pagada) return;

      await api.post("/multas/pagar", {
        attendanceId: id,
        socioId: cedula,
        monto: multa.valor,
      });

      toast({
        title: "Multa pagada correctamente",
        status: "success",
      });

      const res = await api.get(`/socios/${cedula}/cuenta`);

      if (isMounted.current) {
        setData({
          ...res.data,
          creditos: res.data.creditos || [],
          creditosEspeciales: res.data.creditosEspeciales || [],
          multas: res.data.multas || [],
        });
      }
    } catch {
      toast({
        title: "Error al pagar multa",
        status: "error",
      });
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

  /* =====================
     CALCULOS
  ===================== */

  const totalCreditosNormales = data.creditos.reduce(
    (sum, c) => sum + c.monto,
    0
  );

  const totalCreditosEspeciales = data.creditosEspeciales.reduce(
    (sum, c) => sum + c.total,
    0
  );

  const totalGeneralCreditos =
    totalCreditosNormales + totalCreditosEspeciales;

  /*const esSocioNuevo =
    data.capital === 0 &&
    data.creditos.length === 0 &&
    data.creditosEspeciales.length === 0 &&
    data.multas.length === 0;*/

  /* =====================
     RENDER
  ===================== */

  return (
    <MotionBox
      maxW="1200px"
      mx="auto"
      p={8}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* HEADER */}
      <HStack mb={6} spacing={4}>
        <Button
          leftIcon={<FiArrowLeft />}
          size="sm"
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>

        <Heading size="lg">
          Resumen de Cuenta del Socio
        </Heading>
      </HStack>

      {/* RESUMEN EJECUTIVO */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={6} mb={10}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>
                <HStack>
                  <Icon as={FiUser} />
                  <Text>Socio</Text>
                </HStack>
              </StatLabel>
              <StatNumber fontSize="md">
                {data.nombre}
              </StatNumber>
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
              <StatNumber>
                ${data.capital.toFixed(2)}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>
                <HStack>
                  <Icon as={FiCreditCard} />
                  <Text>Créditos Totales</Text>
                </HStack>
              </StatLabel>
              <StatNumber>
                ${totalGeneralCreditos.toFixed(2)}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>
                <HStack>
                  <Icon as={FiAlertTriangle} />
                  <Text>Multas</Text>
                </HStack>
              </StatLabel>
              <StatNumber>
                ${data.totalMultas.toFixed(2)}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Estado</StatLabel>
              <Badge
                mt={2}
                colorScheme={
                  data.estadoCuenta === "AL_DIA"
                    ? "green"
                    : "red"
                }
                px={3}
                py={1}
                borderRadius="md"
              >
                {data.estadoCuenta === "AL_DIA"
                  ? "AL DÍA"
                  : "TIENE DEUDAS"}
              </Badge>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* CREDITOS */}
      <Card mb={8}>
        <CardBody>
          <Heading size="md" mb={4}>
            Créditos del Socio
          </Heading>

          {data.creditos.length === 0 &&
          data.creditosEspeciales.length === 0 ? (
            <Text color="gray.500">
              El socio no registra créditos.
            </Text>
          ) : (
            <Stack spacing={4}>
              {data.creditos.map((c) => (
                <HStack
                  key={`normal-${c.id}`}
                  justify="space-between"
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                >
                  <Box>
                    <Text fontWeight="bold">
                      Crédito Ordinario #{c.id}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Fecha:{" "}
                      {c.fecha
                        ? new Date(c.fecha).toLocaleDateString("es-EC")
                        : "Sin fecha"}
                    </Text>
                  </Box>

                  <Stack align="end">
                    <Badge
                      colorScheme={
                        c.estado === "PAGADO"
                          ? "green"
                          : c.estado === "ACTIVO"
                          ? "orange"
                          : "red"
                      }
                    >
                      {c.estado}
                    </Badge>

                    <Text fontWeight="bold">
                      ${c.monto.toFixed(2)}
                    </Text>
                  </Stack>
                </HStack>
              ))}

              {data.creditosEspeciales.map((c) => (
                <HStack
                  key={`especial-${c.id}`}
                  justify="space-between"
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  bg="blue.50"
                >
                  <Box>
                    <Text fontWeight="bold">
                      Crédito Especial #{c.id}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Fecha:{" "}
                      {new Date(c.fecha).toLocaleDateString("es-EC")}
                    </Text>
                  </Box>

                  <Badge
                    colorScheme={c.pagado ? "green" : "blue"}
                  >
                    ${c.total.toFixed(2)}{" "}
                    ({c.pagado ? "Pagado" : "Pendiente"})
                  </Badge>
                </HStack>
              ))}
            </Stack>
          )}
        </CardBody>
      </Card>

      {/* MULTAS */}
      <Card>
        <CardBody>
          <Heading size="md" mb={4}>
            Multas
          </Heading>

          {data.multas.length === 0 ? (
            <Text color="gray.500">
              El socio no tiene multas registradas.
            </Text>
          ) : (
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
                    <Icon
                      as={FiAlertTriangle}
                      color="orange.400"
                    />
                    <Text>
                      ${m.valor.toFixed(2)} —{" "}
                      {new Date(m.fecha).toLocaleDateString(
                        "es-EC"
                      )}
                    </Text>
                  </HStack>

                  <Button
                    size="sm"
                    colorScheme={
                      m.pagada ? "green" : "teal"
                    }
                    isDisabled={
                      m.pagada ||
                      payingId === m.id
                    }
                    onClick={() =>
                      payMulta(m.id)
                    }
                  >
                    {m.pagada
                      ? "Pagada"
                      : "Pagar"}
                  </Button>
                </HStack>
              ))}
            </Stack>
          )}
        </CardBody>
      </Card>
    </MotionBox>
  );
}
