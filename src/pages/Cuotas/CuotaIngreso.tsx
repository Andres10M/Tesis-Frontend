import {
  Box,
  Heading,
  Select,
  Input,
  Button,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { obtenerPendientesIngreso, registrarCuotaIngreso } from '../../services/cuotas.api';
import type { Socio } from '../../types/cuota';

export default function CuotaIngreso() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [socio, setSocio] = useState('');
  const [monto, setMonto] = useState(275); // monto por defecto 275

  useEffect(() => {
    obtenerPendientesIngreso().then(setSocios);
  }, []);

  const guardar = async () => {
    if (!socio) return alert('Seleccione socio');
    await registrarCuotaIngreso(socio, monto);
    alert('Cuota de ingreso registrada y socio activado');
    setSocio(''); // limpiar selección
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Cuota de Ingreso
      </Heading>

      <VStack spacing={4} maxW="400px">
        <Select
          placeholder="Seleccione socio"
          value={socio}
          onChange={(e) => setSocio(e.target.value)}
        >
          {socios.map((s) => (
            <option key={s.nui} value={s.nui}>
              {s.firstname} {s.lastname}
            </option>
          ))}
        </Select>

        <Input
          type="number"
          value={monto}
          onChange={(e) => setMonto(Number(e.target.value))}
          min={275}
        />

        <Button colorScheme="purple" onClick={guardar}>
          Registrar ingreso
        </Button>
      </VStack>
    </Box>
  );
}
