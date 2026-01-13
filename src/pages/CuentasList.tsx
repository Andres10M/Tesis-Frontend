import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Input,
  Text,
} from '@chakra-ui/react';
import { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import formatMoney from '../utils/formatMoney';

interface Cuenta {
  person: {
    nui: string;
    firstname: string;
    lastname: string;
  };
  finanzas?: {
    capitalDic2024?: number | string;
    aporteMensual2025?: number | string;
    capitalJunio2025?: number | string;
  };
}

export default function CuentasList() {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [nui, setNui] = useState('');

  useEffect(() => {
    api
      .get('/cuentas')
      .then(res => setCuentas(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const cuentasFiltradas = useMemo(() => {
    if (!nui) return cuentas;
    return cuentas.filter(c => c.person.nui === nui);
  }, [cuentas, nui]);

  const parse = (v?: number | string) =>
    Number(String(v ?? 0).replace(',', '.')) || 0;

  const totalDic = cuentasFiltradas.reduce(
    (a, c) => a + parse(c.finanzas?.capitalDic2024),
    0
  );
  const totalAporte = cuentasFiltradas.reduce(
    (a, c) => a + parse(c.finanzas?.aporteMensual2025),
    0
  );
  const totalJunio = cuentasFiltradas.reduce(
    (a, c) => a + parse(c.finanzas?.capitalJunio2025),
    0
  );

  if (loading) {
    return (
      <Box p={10} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Heading mb={4}>Listado de Cuentas</Heading>

      <Input
        placeholder="Buscar por cédula"
        maxW="300px"
        mb={4}
        value={nui}
        onChange={e => setNui(e.target.value.replace(/\D/g, ''))}
      />

      {cuentasFiltradas.length === 0 ? (
        <Text>No hay datos</Text>
      ) : (
        <Table size="sm" variant="striped">
          <Thead>
            <Tr>
              <Th>Cédula</Th>
              <Th>Socio</Th>
              <Th isNumeric>Capital Dic 2024</Th>
              <Th isNumeric>Aporte Mensual 2025</Th>
              <Th isNumeric>Capital Junio 2025</Th>
            </Tr>
          </Thead>

          <Tbody>
            {cuentasFiltradas.map(c => (
              <Tr key={c.person.nui}>
                <Td>{c.person.nui}</Td>
                <Td>
                  {c.person.firstname} {c.person.lastname}
                </Td>
                <Td isNumeric>
                  {formatMoney(parse(c.finanzas?.capitalDic2024))}
                </Td>
                <Td isNumeric>
                  {formatMoney(parse(c.finanzas?.aporteMensual2025))}
                </Td>
                <Td isNumeric>
                  {formatMoney(parse(c.finanzas?.capitalJunio2025))}
                </Td>
              </Tr>
            ))}

            <Tr key="TOTAL" fontWeight="bold">
              <Td colSpan={2}>TOTAL</Td>
              <Td isNumeric>{formatMoney(totalDic)}</Td>
              <Td isNumeric>{formatMoney(totalAporte)}</Td>
              <Td isNumeric>{formatMoney(totalJunio)}</Td>
            </Tr>
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
