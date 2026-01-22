import { Box, Heading, SimpleGrid, Button, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function CuotasDashboard() {
  const navigate = useNavigate();

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Cuotas
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Box p={6} bg="white" borderRadius="lg" shadow="md">
          <Text fontWeight="bold" mb={4}>
            Cuota $2
          </Text>
          <Button
            colorScheme="green"
            w="100%"
            onClick={() => navigate("/cuotas/2")}
          >
            Registrar
          </Button>
        </Box>

        <Box p={6} bg="white" borderRadius="lg" shadow="md">
          <Text fontWeight="bold" mb={4}>
            Cuota $20
          </Text>
          <Button
            colorScheme="blue"
            w="100%"
            onClick={() => navigate("/cuotas/20")}
          >
            Registrar
          </Button>
        </Box>

        <Box p={6} bg="white" borderRadius="lg" shadow="md">
          <Text fontWeight="bold" mb={4}>
            Cuota de Ingreso
          </Text>
          <Button
            colorScheme="purple"
            w="100%"
            onClick={() => navigate("/cuotas/ingreso")}
          >
            Registrar
          </Button>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
