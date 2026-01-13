import {
  Box,
  Button,
  Heading,
  HStack,
  Text,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Reuniones() {
  const [reuniones, setReuniones] = useState<any[]>([]);
  const [fecha, setFecha] = useState("");
  const [reunionAEliminar, setReunionAEliminar] = useState<any>(null);

  const toast = useToast();
  const navigate = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Cargar reuniones
  const cargar = async () => {
    try {
      const res = await api.get("/meetings");
      setReuniones(res.data);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo cargar las reuniones",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Crear reunión
  const crear = async () => {
    if (!fecha) return;

    try {
      await api.post("/meetings", { fecha });

      toast({
        title: "Reunión creada",
        status: "success",
        duration: 2500,
      });

      setFecha("");
      cargar();
    } catch {
      toast({
        title: "Error",
        description: "No se pudo crear la reunión",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Eliminar reunión
  const borrar = async () => {
    if (!reunionAEliminar) return;

    try {
      await api.delete(`/meetings/${reunionAEliminar.id}`);

      toast({
        title: "Reunión eliminada",
        status: "info",
        duration: 2500,
      });

      setReunionAEliminar(null);
      onClose();
      cargar();
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar la reunión",
        status: "error",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const formatearFecha = (fechaStr: string) =>
    new Date(fechaStr).toLocaleDateString("es-ES");

  return (
    <Box p={8}>
      <Heading mb={6}>Gestión de Reuniones</Heading>

      {/* CREAR REUNIÓN */}
      <HStack mb={6}>
        <Input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          maxW="250px"
        />
        <Button colorScheme="blue" onClick={crear} isDisabled={!fecha}>
          + Nueva Reunión
        </Button>
      </HStack>

      {/* TABLA */}
      <Table variant="simple">
        <Thead bg="gray.100">
          <Tr>
            <Th>FECHA</Th>
            <Th textAlign="right">ACCIONES</Th>
          </Tr>
        </Thead>

        <Tbody>
          {reuniones.length === 0 && (
            <Tr>
              <Td colSpan={2}>
                <Text textAlign="center" color="gray.500">
                  No hay reuniones registradas
                </Text>
              </Td>
            </Tr>
          )}

          {reuniones.map((r) => (
            <Tr key={r.id}>
              <Td>{formatearFecha(r.fecha)}</Td>

              <Td textAlign="right">
                <HStack justify="flex-end">
                  {/* ORDEN SOLICITADO */}
                  <Button
                    size="sm"
                    colorScheme="teal"
                    variant="outline"
                    onClick={() =>
                      navigate(`/reuniones/${r.id}/asistencia`)
                    }
                  >
                    Asistencia
                  </Button>

                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={() =>
                      navigate(`/reuniones/${r.id}/orden-dia`)
                    }
                  >
                    Orden del Día
                  </Button>

                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => {
                      setReunionAEliminar(r);
                      onOpen();
                    }}
                  >
                    Eliminar
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* ALERT DIALOG */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar reunión
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Está seguro de eliminar la reunión del{" "}
              <b>
                {reunionAEliminar &&
                  formatearFecha(reunionAEliminar.fecha)}
              </b>
              ?  
              <br />
              Esta acción no se puede deshacer.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={borrar} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
