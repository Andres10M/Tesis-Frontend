import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Stack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

interface Socio {
  nui: string;
  firstname: string;
  lastname: string;
  orderIndex?: number;
}

export default function SociosList() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [form, setForm] = useState({
    nui: "",
    firstname: "",
    lastname: "",
    oldNui: null as string | null,
  });

  const [socioAEliminar, setSocioAEliminar] = useState<Socio | null>(null);

  const toast = useToast();
  const navigate = useNavigate(); // 👈 PARA IR A LA CUENTA

  // Modal crear / editar
  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();

  // AlertDialog eliminar
  const {
    isOpen: isAlertOpen,
    onOpen: openAlert,
    onClose: closeAlert,
  } = useDisclosure();

  const cancelRef = useRef<HTMLButtonElement>(null);

  // ==========================
  // CARGAR SOCIOS
  // ==========================
  const load = async () => {
    try {
      const res = await api.get("/person");
      setSocios(res.data);
    } catch {
      toast({ title: "Error cargando socios", status: "error" });
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ==========================
  // NUEVO SOCIO
  // ==========================
  const openNew = () => {
    setForm({ nui: "", firstname: "", lastname: "", oldNui: null });
    openModal();
  };

  // ==========================
  // EDITAR SOCIO
  // ==========================
  const openEdit = (s: Socio) => {
    setForm({
      nui: s.nui,
      firstname: s.firstname,
      lastname: s.lastname,
      oldNui: s.nui,
    });
    openModal();
  };

  // ==========================
  // GUARDAR
  // ==========================
  const save = async () => {
    try {
      if (!form.nui || form.nui.length !== 10) {
        toast({ title: "Cédula inválida", status: "warning" });
        return;
      }

      if (!form.firstname || !form.lastname) {
        toast({ title: "Complete nombres y apellidos", status: "warning" });
        return;
      }

      if (form.oldNui) {
        await api.patch(`/person/${form.oldNui}`, {
          nui: form.nui,
          firstname: form.firstname,
          lastname: form.lastname,
        });
        toast({ title: "Socio actualizado", status: "success" });
      } else {
        await api.post("/person", {
          nui: form.nui,
          firstname: form.firstname,
          lastname: form.lastname,
        });
        toast({ title: "Socio creado", status: "success" });
      }

      closeModal();
      load();
    } catch (e: any) {
      toast({
        title: e.response?.data?.message || "Error",
        status: "error",
      });
    }
  };

  // ==========================
  // ELIMINAR
  // ==========================
  const confirmRemove = (s: Socio) => {
    setSocioAEliminar(s);
    openAlert();
  };

  const remove = async () => {
    if (!socioAEliminar) return;

    try {
      await api.delete(`/person/${socioAEliminar.nui}`);
      toast({ title: "Socio eliminado", status: "info" });
      closeAlert();
      load();
    } catch {
      toast({ title: "Error al eliminar socio", status: "error" });
    }
  };

  return (
    <Box p={8}>
      <Heading mb={6}>Gestión de Socios</Heading>

      <Button colorScheme="green" mb={4} onClick={openNew}>
        + Nuevo Socio
      </Button>

      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>Cédula</Th>
            <Th>Nombres</Th>
            <Th>Apellidos</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {socios
            .slice()
            .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
            .map((s) => (
              <Tr key={s.nui}>
                <Td>{s.nui}</Td>
                <Td>{s.firstname}</Td>
                <Td>{s.lastname}</Td>
                <Td>
                  <Stack direction="row" spacing={2}>
                    {/* 👇 BOTÓN CLAVE */}
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => navigate(`/socios/${s.nui}/cuenta`)}
                    >
                      Ver cuenta
                    </Button>

                    <Button size="sm" onClick={() => openEdit(s)}>
                      Editar
                    </Button>

                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => confirmRemove(s)}
                    >
                      Eliminar
                    </Button>
                  </Stack>
                </Td>
              </Tr>
            ))}
        </Tbody>
      </Table>

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {form.oldNui ? "Editar Socio" : "Nuevo Socio"}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Stack spacing={4}>
              <Input
                placeholder="Cédula (10 números)"
                maxLength={10}
                value={form.nui}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nui: e.target.value.replace(/\D/g, ""),
                  })
                }
              />

              <Input
                placeholder="Nombres"
                value={form.firstname}
                onChange={(e) =>
                  setForm({
                    ...form,
                    firstname: e.target.value.replace(
                      /[^a-zA-Z\sáéíóúÁÉÍÓÚñÑ]/g,
                      ""
                    ),
                  })
                }
              />

              <Input
                placeholder="Apellidos"
                value={form.lastname}
                onChange={(e) =>
                  setForm({
                    ...form,
                    lastname: e.target.value.replace(
                      /[^a-zA-Z\sáéíóúÁÉÍÓÚñÑ]/g,
                      ""
                    ),
                  })
                }
              />
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={closeModal}>
              Cancelar
            </Button>
            <Button colorScheme="green" onClick={save}>
              {form.oldNui ? "Actualizar" : "Guardar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ALERT ELIMINAR */}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeAlert}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar socio
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Eliminar a{" "}
              <b>
                {socioAEliminar?.firstname} {socioAEliminar?.lastname}
              </b>
              ?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeAlert}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={remove} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
