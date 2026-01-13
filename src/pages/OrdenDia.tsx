import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Textarea,
  Heading,
  useToast,
  HStack,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function OrdenDia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [orden, setOrden] = useState('');
  const [editable, setEditable] = useState(false);

  useEffect(() => {
    const cargarOrden = async () => {
      try {
        const res = await api.get(`/meetings/${id}`);
        setOrden(res.data.descripcion || '');
        setEditable(false);
      } catch {
        toast({
          title: 'Error al cargar orden del día',
          status: 'error',
        });
      }
    };

    cargarOrden();
  }, [id]);

  const actualizarOrden = async () => {
    try {
      await api.put(`/meetings/${id}/orden`, { orden });

      toast({
        title: 'Orden del día actualizada',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setEditable(false);
    } catch {
      toast({
        title: 'Error al guardar',
        status: 'error',
      });
    }
  };

  return (
    <Box maxW="900px" mx="auto" mt={8}>

      {/* ENCABEZADO */}
      <HStack mb={6} spacing={4} align="center">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </Button>

        <Heading
          size="xl"          // 🔥 MÁS GRANDE
          fontWeight="bold"
        >
          Orden del Día
        </Heading>
      </HStack>

      <Textarea
  value={orden}
  onChange={(e) => setOrden(e.target.value)}
  minH="480px"
  resize="vertical"
  fontFamily="serif"
  fontSize="md"
  isDisabled={!editable}
  border="2px solid"
  borderColor="gray.300"

  /* 🔥 ELIMINA FONDO BLANCO REAL */
  bg="transparent"
  sx={{
    backgroundColor: 'transparent !important',
    boxShadow: 'none',
  }}

  _focus={{
    bg: 'transparent',
  }}
/>


      {/* BOTONES */}
      <HStack mt={6} spacing={4}>
        {!editable ? (
          <Button
            colorScheme="blue"
            onClick={() => setEditable(true)}
          >
            Editar Orden del Día
          </Button>
        ) : (
          <Button
            colorScheme="green"
            onClick={actualizarOrden}
          >
            Actualizar
          </Button>
        )}
      </HStack>

    </Box>
  );
}
