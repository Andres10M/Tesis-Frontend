import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Text,
  Heading,
  Button,
  Flex,
} from "@chakra-ui/react";

interface FilaCredito {
  nombre: string;
  monto: number;
}

const INTERES = 0.02;

export default function CreditosEspecialesReunion() {
  const navigate = useNavigate();

  const [fecha] = useState<string>(
    new Date().toLocaleDateString("es-EC")
  );

  const [filas, setFilas] = useState<FilaCredito[]>(
    Array.from({ length: 20 }, () => ({
      nombre: "",
      monto: 0,
    }))
  );

  const actualizarFila = (
    index: number,
    campo: keyof FilaCredito,
    valor: string
  ) => {
    const copia = [...filas];
    copia[index] = {
      ...copia[index],
      [campo]: campo === "monto" ? Number(valor) : valor,
    };
    setFilas(copia);
  };

  const totalMonto = filas.reduce((a, b) => a + (b.monto || 0), 0);
  const totalInteres = totalMonto * INTERES;
  const totalPagar = totalMonto + totalInteres;

  const guardarCreditos = () => {
    const data = {
      fecha,
      creditos: filas.filter(
        (f) => f.nombre.trim() !== "" && f.monto > 0
      ),
      totales: {
        monto: totalMonto,
        interes: totalInteres,
        total: totalPagar,
      },
    };

    console.log("CRÉDITOS ESPECIALES:", data);
    alert("Créditos guardados (por ahora en consola)");
  };

  return (
    <Box p={6}>
      {/* BOTONES SUPERIORES */}
      <Flex justify="space-between" align="center" mb={4}>
        <Button size="sm" onClick={() => navigate(-1)}>
          ⬅ Volver
        </Button>

        <Button
          size="sm"
          colorScheme="green"
          onClick={guardarCreditos}
        >
          💾 Guardar créditos
        </Button>
      </Flex>

      {/* TITULO + FECHA */}
      <Flex align="center" gap={4} mb={2}>
        <Heading size="md">Créditos Especiales</Heading>
        <Text fontSize="sm" color="gray.600">
          Fecha: {fecha}
        </Text>
      </Flex>

      <Table size="sm" variant="simple">
        <Thead bg="gray.100">
          <Tr>
            <Th>#</Th>
            <Th>Nombres completos</Th>
            <Th isNumeric>Monto prestado</Th>
            <Th isNumeric>Interés (2%)</Th>
            <Th isNumeric>Total a pagar</Th>
            <Th>Firma</Th>
          </Tr>
        </Thead>

        <Tbody>
          {filas.map((fila, i) => {
            const interes = fila.monto * INTERES;
            const total = fila.monto + interes;

            return (
              <Tr key={i}>
                <Td>{i + 1}</Td>

                <Td>
                  <Input
                    size="sm"
                    placeholder="Nombre completo"
                    value={fila.nombre}
                    onChange={(e) =>
                      actualizarFila(i, "nombre", e.target.value)
                    }
                  />
                </Td>

                <Td isNumeric>
                  <Input
                    size="sm"
                    type="number"
                    value={fila.monto || ""}
                    onChange={(e) =>
                      actualizarFila(i, "monto", e.target.value)
                    }
                  />
                </Td>

                <Td isNumeric>${interes.toFixed(2)}</Td>
                <Td isNumeric>${total.toFixed(2)}</Td>
                <Td />
              </Tr>
            );
          })}

          {/* TOTALES */}
          <Tr bg="gray.200" fontWeight="bold">
            <Td colSpan={2}>TOTAL</Td>
            <Td isNumeric>${totalMonto.toFixed(2)}</Td>
            <Td isNumeric>${totalInteres.toFixed(2)}</Td>
            <Td isNumeric>${totalPagar.toFixed(2)}</Td>
            <Td />
          </Tr>
        </Tbody>
      </Table>

      <Box mt={6}>
        <Text fontWeight="bold">FIRMA RECIBIDO:</Text>
      </Box>
    </Box>
  );
}
