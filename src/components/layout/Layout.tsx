import { Box, Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

export default function Layout() {
  return (
    <Flex minH="100vh">
      {/* SIDEBAR FIJO */}
      <Sidebar />

      {/* CONTENIDO CON ANIMACIÓN */}
      <MotionBox
        flex="1"
        ml="260px"              // 👈 ESPACIO DEL SIDEBAR
        p={6}
        bg="gray.50"
        minH="100vh"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Outlet />
      </MotionBox>
    </Flex>
  );
}