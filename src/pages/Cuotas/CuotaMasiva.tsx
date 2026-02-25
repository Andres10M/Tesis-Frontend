import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  Badge,
  Button,
  useToast,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api";

export default function CuotaMasiva() {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [reunion, setReunion] = useState<any>(null);
  const [socios, setSocios] = useState<any[]>([]);
  const [pagos2, setPagos2] = useState<Record<string, boolean>>({});
  const [pagos20, setPagos20] = useState<Record<string, boolean>>({});

  const [pendiente, setPendiente] = useState<{
    tipo: "2" | "20";
    nui: string;
  } | null>(null);

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    const [reunionRes, sociosRes, cuotasRes] = await Promise.all([
      api.get(`/meetings/${id}`),
      api.get("/person"),
      api.get(`/cuotas/reunion/${id}`),
    ]);

    setReunion(reunionRes.data);
    setSocios(sociosRes.data);

    const init2: Record<string, boolean> = {};
    const init20: Record<string, boolean> = {};

    sociosRes.data.forEach((s: any) => {
      init2[s.nui] = false;
      init20[s.nui] = false;
    });

    cuotasRes.data.forEach((c: any) => {
      if (c.pagado) {
        if (c.tipo === "APORTE_2") init2[c.socioId] = true;
        if (c.tipo === "CUOTA_20") init20[c.socioId] = true;
      }
    });

    setPagos2(init2);
    setPagos20(init20);
  };

  const togglePago = (tipo: "2" | "20", nui: string, value: boolean) => {
    if (!value) {
      setPendiente({ tipo, nui });
      onOpen();
      return;
    }
    aplicarCambio(tipo, nui, true);
  };

  const aplicarCambio = (tipo: "2" | "20", nui: string, value: boolean) => {
    if (tipo === "2") {
      setPagos2((prev) => ({ ...prev, [nui]: value }));
    } else {
      setPagos20((prev) => ({ ...prev, [nui]: value }));
    }
  };

  const confirmarQuitar = () => {
    if (!pendiente) return;
    aplicarCambio(pendiente.tipo, pendiente.nui, false);
    setPendiente(null);
    onClose();
  };

  const guardarTodo = async () => {
    await api.post("/cuotas/masiva", {
      meetingId: Number(id),
      pagos2,
      pagos20,
    });

    toast({
      title: "Pagos guardados correctamente",
      status: "success",
    });
  };

  const total2 = Object.values(pagos2).filter(Boolean).length;
  const total20 = Object.values(pagos20).filter(Boolean).length;

  const fecha = reunion
    ? new Date(reunion.fecha).toLocaleDateString("es-ES")
    : "";

  return (
    <Box p={8}>
      <Button mb={4} variant="ghost" onClick={() => navigate(-1)}>
        ← Volver
      </Button>

      <Heading mb={2}>Reunión del {fecha}</Heading>
      <Divider my={4} />

      <HStack spacing={10} mb={6}>
        <Stat>
          <StatLabel>Cuota $2</StatLabel>
          <StatNumber>{total2} → ${total2 * 2}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel>Cuota $20</StatLabel>
          <StatNumber>{total20} → ${total20 * 20}</StatNumber>
        </Stat>
      </HStack>

      <Table bg="white" shadow="md">
        <Thead>
          <Tr>
            <Th>Cédula</Th>
            <Th>Socio</Th>
            <Th textAlign="center">$2</Th>
            <Th textAlign="center">$20</Th>
            <Th textAlign="center">Estado</Th>
          </Tr>
        </Thead>

        <Tbody>
          {socios.map((s) => {
            const ok = pagos2[s.nui] || pagos20[s.nui];

            return (
              <Tr key={s.nui}>
                <Td>{s.nui}</Td>
                <Td>{s.firstname} {s.lastname}</Td>

                <Td textAlign="center">
                  <Checkbox
                    colorScheme="blue"
                    size="lg"
                    sx={{
                      span: {
                        borderColor: "gray.400",
                        bg: "gray.100",
                      },
                    }}
                    isChecked={pagos2[s.nui]}
                    onChange={(e) =>
                      togglePago("2", s.nui, e.target.checked)
                    }
                  />
                </Td>

                <Td textAlign="center">
                  <Checkbox
                    colorScheme="blue"
                    size="lg"
                    sx={{
                      span: {
                        borderColor: "gray.400",
                        bg: "gray.100",
                      },
                    }}
                    isChecked={pagos20[s.nui]}
                    onChange={(e) =>
                      togglePago("20", s.nui, e.target.checked)
                    }
                  />
                </Td>

                <Td textAlign="center">
                  <Badge colorScheme={ok ? "green" : "red"}>
                    {ok ? "OK" : "NO"}
                  </Badge>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      <Button mt={6} colorScheme="blue" size="lg" onClick={guardarTodo}>
        Guardar cuentas
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar cambio</ModalHeader>
          <ModalBody>
            <Text>
              ¿Seguro que deseas quitar este pago?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Cancelar</Button>
            <Button colorScheme="red" onClick={confirmarQuitar} ml={3}>
              Sí, quitar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
