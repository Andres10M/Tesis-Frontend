import {
  Box,
  Heading,
  Select,
  Input,
  Button,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { obtenerSocios, registrarCuotaIngreso } from "../../services/cuotas.api";
import type { Socio } from "../../types/cuota";

export default function CuotaIngreso() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [socio, setSocio] = useState("");
  const [monto, setMonto] = useState(5000);

  useEffect(() => {
    obtenerSocios().then(setSocios);
  }, []);

  const guardar = async () => {
    if (!socio) return alert("Seleccione socio");
    await registrarCuotaIngreso(socio, monto);
    alert("Cuota de ingreso registrada");
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
        />

        <Button colorScheme="purple" onClick={guardar}>
          Registrar ingreso
        </Button>
      </VStack>
    </Box>
  );
}
