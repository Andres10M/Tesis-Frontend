import {
  Box,
  Grid,
  Heading,
  Text,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { api } from "../services/api";
import {
  FaUsers,
  FaDollarSign,
  FaHandHoldingUsd,
  FaExclamationTriangle,
  FaCalendarAlt,
} from "react-icons/fa";

interface Resumen {
  totalSocios: number;
  totalAhorros: number;
  totalCreditosActivos: number;
  totalRecaudadoUltimaReunion: number;
  totalMultasPendientes: number;
  proximaReunion?: {
    fecha: string;
    descripcion: string;
  };
}

const PRIMARY_BLUE = "#1E3A8A";   // Azul sidebar
const LIGHT_BLUE = "#3B82F6";     // Azul acento

export default function DashboardPage() {
  const [data, setData] = useState<Resumen | null>(null);

  useEffect(() => {
    api.get("/dashboard/resumen").then((res) => {
      setData(res.data);
    });
  }, []);

  if (!data)
    return (
      <Flex justify="center" align="center" h="60vh">
        <Spinner size="xl" color={PRIMARY_BLUE} />
      </Flex>
    );

  const barData = [
    { name: "Ahorros", valor: data.totalAhorros },
    { name: "Multas", valor: data.totalMultasPendientes },
  ];

  const lineData = [
    { mes: "Ene", monto: 100 },
    { mes: "Feb", monto: 200 },
    { mes: "Mar", monto: 250 },
    { mes: "Abr", monto: 300 },
    { mes: "May", monto: data.totalAhorros },
  ];

  return (
    <Box p={10} bg="#F1F5F9" minH="100vh">
      <Heading mb={10} fontWeight="700" color="gray.700">
        Panel Administrativo
      </Heading>

      {/* TARJETAS */}
      <Grid templateColumns="repeat(3, 1fr)" gap={8} mb={12}>
        <Card title="Socios Activos" value={data.totalSocios} icon={<FaUsers />} />
        <Card title="Total Ahorros" value={`$${data.totalAhorros}`} icon={<FaDollarSign />} />
        <Card title="Créditos Activos" value={data.totalCreditosActivos} icon={<FaHandHoldingUsd />} />
        <Card title="Recaudado Última Reunión" value={`$${data.totalRecaudadoUltimaReunion}`} icon={<FaDollarSign />} />
        <Card title="Multas Pendientes" value={`$${data.totalMultasPendientes}`} icon={<FaExclamationTriangle />} />
        <Card
          title="Próxima Reunión"
          value={
            data.proximaReunion
              ? new Date(data.proximaReunion.fecha).toLocaleDateString()
              : "No programada"
          }
          icon={<FaCalendarAlt />}
        />
      </Grid>

      {/* GRÁFICOS */}
      <Grid templateColumns="repeat(2, 1fr)" gap={8}>
        <Box
          bg="white"
          p={6}
          borderRadius="18px"
          boxShadow="0 6px 18px rgba(0,0,0,0.06)"
          height="350px"
        >
          <Heading size="md" mb={6} color="gray.600">
            Ahorros vs Multas
          </Heading>

          <ResponsiveContainer>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Bar
                dataKey="valor"
                fill={LIGHT_BLUE}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box
          bg="white"
          p={6}
          borderRadius="18px"
          boxShadow="0 6px 18px rgba(0,0,0,0.06)"
          height="350px"
        >
          <Heading size="md" mb={6} color="gray.600">
            Crecimiento de Ahorros
          </Heading>

          <ResponsiveContainer>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="mes" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="monto"
                stroke={PRIMARY_BLUE}
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Grid>
    </Box>
  );
}

function Card({ title, value, icon }: any) {
  return (
    <Box
      bg="white"
      p={6}
      borderRadius="18px"
      boxShadow="0 6px 18px rgba(0,0,0,0.06)"
      transition="all 0.2s ease"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "0 10px 22px rgba(0,0,0,0.08)",
      }}
    >
      <Flex align="center" justify="space-between" mb={4}>
        <Text fontSize="sm" color="gray.500" fontWeight="500">
          {title}
        </Text>

        <Flex
          align="center"
          justify="center"
          w="40px"
          h="40px"
          borderRadius="12px"
          bg="rgba(30,58,138,0.1)"
          color="#1E3A8A"
          fontSize="18px"
        >
          {icon}
        </Flex>
      </Flex>

      <Heading size="lg" color="gray.700">
        {value}
      </Heading>
    </Box>
  );
}