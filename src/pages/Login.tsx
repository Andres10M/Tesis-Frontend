import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  Image,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

// 👉 contenedor animado
const MotionBox = motion(Box);

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.access_token);
      navigate("/socios");
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <Box
      minH="100vh"
      bg="gray.100"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <MotionBox
        bg="white"
        p={8}
        w="380px"
        borderRadius="xl"
        boxShadow="2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <VStack spacing={5}>
          {/* LOGO */}
          <Image
            src="/src/assets/logo.png.jpeg"
            alt="Cooperativa San Juan"
            boxSize="250px"
            objectFit="contain"
            mb={2}
          />

          <Heading size="md" textAlign="center">
            Administración
          </Heading>

          <Text fontSize="sm" color="gray.500" textAlign="center">
            Cooperativa de Ahorro y Crédito San Juan
          </Text>

          {error && (
            <Text color="red.500" fontSize="sm">
              {error}
            </Text>
          )}

          <Input
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            colorScheme="blue"
            w="100%"
            mt={2}
            onClick={handleLogin}
          >
            Ingresar
          </Button>
        </VStack>
      </MotionBox>
    </Box>
  );
}
