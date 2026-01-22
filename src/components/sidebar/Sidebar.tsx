import { Box, VStack, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <Box
      w="260px"
      bg="brand.600"
      color="white"
      p={6}
      minH="100vh"
    >
      <Text fontSize="lg" fontWeight="semibold" mb={8}>
        Cooperativa San Juan
      </Text>

      <VStack align="start" spacing={3} w="100%">
        {/* SOCIOS */}
        <NavLink to="/socios" style={{ width: "100%" }}>
          {({ isActive }) => (
            <Text
              w="100%"
              p={2}
              borderRadius="md"
              bg={isActive ? "brand.500" : "transparent"}
              _hover={{ bg: "brand.500" }}
            >
              Socios
            </Text>
          )}
        </NavLink>

        {/* CUOTAS ✅ */}
        <NavLink to="/cuotas" style={{ width: "100%" }}>
          {({ isActive }) => (
            <Text
              w="100%"
              p={2}
              borderRadius="md"
              bg={isActive ? "brand.500" : "transparent"}
              _hover={{ bg: "brand.500" }}
            >
              Cuotas
            </Text>
          )}
        </NavLink>

        {/* REUNIONES */}
        <NavLink to="/reuniones" style={{ width: "100%" }}>
          {({ isActive }) => (
            <Text
              w="100%"
              p={2}
              borderRadius="md"
              bg={isActive ? "brand.500" : "transparent"}
              _hover={{ bg: "brand.500" }}
            >
              Reuniones
            </Text>
          )}
        </NavLink>

        {/* CUENTAS */}
        <NavLink to="/cuentas" style={{ width: "100%" }}>
          {({ isActive }) => (
            <Text
              w="100%"
              p={2}
              borderRadius="md"
              bg={isActive ? "brand.500" : "transparent"}
              _hover={{ bg: "brand.500" }}
            >
              Cuentas
            </Text>
          )}
        </NavLink>

        {/* MULTAS */}
        <NavLink to="/multas" style={{ width: "100%" }}>
          {({ isActive }) => (
            <Text
              w="100%"
              p={2}
              borderRadius="md"
              bg={isActive ? "brand.500" : "transparent"}
              _hover={{ bg: "brand.500" }}
            >
              Multas
            </Text>
          )}
        </NavLink>
      </VStack>
    </Box>
  );
}
