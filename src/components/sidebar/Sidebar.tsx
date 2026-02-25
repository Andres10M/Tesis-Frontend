import { Box, VStack, Text, Image } from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionText = motion(Text);

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <MotionBox
      position="fixed"
      left="0"
      top="0"
      h="100vh"
      w="260px"
      bg="brand.600"
      color="white"
      p={6}
      overflowY="auto"
      boxShadow="lg"
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* LOGO + NOMBRE */}
      <VStack spacing={4} mb={10}>
        <MotionBox
          p={1}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
        >
          <Image
            src="/src/assets/hoja.png"
            alt="Cooperativa San Juan"
            boxSize="72px"
            objectFit="contain"
          />
        </MotionBox>

        <MotionText
          fontSize="sm"
          fontWeight="semibold"
          textAlign="center"
          lineHeight="short"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          Cooperativa<br />San Juan
        </MotionText>
      </VStack>

      {/* MENÚ */}
      <VStack align="start" spacing={1.5} w="100%">
        {[
          { label: "Dashboard", to: "/dashboard" }, // 🆕 NUEVO
          { label: "Socios", to: "/socios" },
          { label: "Reuniones", to: "/reuniones" },
          { label: "Cuotas", to: "/cuotas" },
          { label: "Créditos Especiales", to: "/creditos-especiales" },
          { label: "Cuentas", to: "/cuentas" },
          { label: "Multas", to: "/multas" },
        ].map((item, index) => (
          <NavLink key={item.to} to={item.to} style={{ width: "100%" }}>
            {({ isActive }) => (
              <MotionText
                w="100%"
                px={3}
                py={2}
                borderRadius="md"
                bg={isActive ? "brand.500" : "transparent"}
                _hover={{ bg: "brand.500" }}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.45 + index * 0.05 }}
              >
                {item.label}
              </MotionText>
            )}
          </NavLink>
        ))}

        {/* LOGOUT */}
        <MotionText
          mt={8}
          color="red.300"
          cursor="pointer"
          fontWeight="semibold"
          whileHover={{ scale: 1.05 }}
          onClick={logout}
        >
          Cerrar sesión
        </MotionText>
      </VStack>
    </MotionBox>
  );
}