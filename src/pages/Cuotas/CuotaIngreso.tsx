import {
  Box,
  Heading,
  Select,
  Input,
  Button,
  VStack,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import {
  obtenerPendientesIngreso,
  registrarCuotaIngreso,
} from '../../services/cuotas.api';
import type { Socio } from '../../types/cuota';

export default function CuotaIngreso() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [socio, setSocio] = useState('');
  const [monto, setMonto] = useState(275);
  const [nombreSocio, setNombreSocio] = useState('');

  const toast = useToast();
  const modal = useDisclosure();

  useEffect(() => {
    obtenerPendientesIngreso().then(setSocios);
  }, []);

  const guardar = async () => {
    if (!socio) {
      toast({
        title: 'Seleccione un socio',
        status: 'warning',
      });
      return;
    }

    try {
      await registrarCuotaIngreso(socio, monto);

      const socioSeleccionado = socios.find(s => s.nui === socio);
      setNombreSocio(
        `${socioSeleccionado?.firstname} ${socioSeleccionado?.lastname}`
      );

      modal.onOpen();
      setSocio('');
    } catch {
      toast({
        title: 'Error al registrar la cuota',
        status: 'error',
      });
    }
  };

  return (
    <Box maxW="600px" mx="auto" p={6}>
      <Heading size="lg" mb={6} textAlign="center">
        Activación de Socio
      </Heading>

      <Card boxShadow="lg" borderRadius="xl">
        <CardBody>
          <VStack spacing={5}>
            <FormControl>
              <FormLabel>Socio pendiente de ingreso</FormLabel>
              <Select
                placeholder="Seleccione un socio"
                value={socio}
                onChange={(e) => setSocio(e.target.value)}
              >
                {socios.map((s) => (
                  <option key={s.nui} value={s.nui}>
                    {s.firstname} {s.lastname}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Cuota de ingreso</FormLabel>
              <Input
                type="number"
                value={monto}
                min={275}
                onChange={(e) => setMonto(Number(e.target.value))}
              />
            </FormControl>

            <Button
              colorScheme="purple"
              size="lg"
              width="100%"
              onClick={guardar}
            >
              Registrar ingreso
            </Button>
          </VStack>
        </CardBody>
      </Card>

      {/* ================= MODAL CONFIRMACIÓN ================= */}
      <Modal isOpen={modal.isOpen} onClose={modal.onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader textAlign="center">
            <Icon as={FiCheckCircle} color="green.400" boxSize={12} />
          </ModalHeader>

          <ModalBody textAlign="center">
            <Heading size="md" mb={2}>
              Socio activado correctamente
            </Heading>
            <Text>
              <strong>{nombreSocio}</strong> ahora es parte activa de la
              cooperativa.
            </Text>
            <Text fontSize="sm" color="gray.500" mt={2}>
              La cuota de ingreso ha sido registrada con éxito.
            </Text>
          </ModalBody>

          <ModalFooter justifyContent="center">
            <Button colorScheme="green" onClick={modal.onClose}>
              Aceptar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
