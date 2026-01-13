import { Box, Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";

export default function Layout() {
  return (
    <Flex minH="100vh">
      <Sidebar />
      <Box flex="1" p={6} bg="gray.50">
        <Outlet />
      </Box>
    </Flex>
  );
}
