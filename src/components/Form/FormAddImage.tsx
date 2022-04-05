import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import * as yup from 'yup';

import { yupResolver } from '@hookform/resolvers/yup';
import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface FormAddImageProps {
  closeModal: () => void;
}

const imageTypesSupported = ['image/png', 'image/gif', 'image/jpeg'];

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  const formValidations = yup.object().shape({
    image: yup
      .mixed()
      .required('Arquivo obrigatório')
      .test('fileSize', 'O arquivo deve ser menor que 10MB', value => {
        return value && value[0].size <= 10000000;
      })
      .test('type', 'Somente são aceitos arquivos PNG, JPEG e GIF', value => {
        return value && imageTypesSupported.includes(value[0].type);
      }),
    title: yup
      .string()
      .required('Título obrigatório')
      .min(2, 'Mínimo de 2 caracteres')
      .max(20, 'Máximo de 20 caracteres'),
    description: yup
      .string()
      .required('Descrição obrigatória')
      .max(65, 'Máximo de 65 caracteres'),
  });

  const queryClient = useQueryClient();
  const mutation = useMutation(
    async (image: Record<string, unknown>) => {
      const response = await api.post('/api/images', {
        title: image.title,
        description: image.description,
        url: imageUrl,
      });

      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('images');
      },
    }
  );

  const { register, handleSubmit, reset, formState, setError, trigger } =
    useForm({
      resolver: yupResolver(formValidations),
    });

  const { errors } = formState;

  const onSubmit = async (data: Record<string, unknown>): Promise<void> => {
    try {
      if (!imageUrl) {
        toast({
          title: 'Imagem não adicionada',
          description:
            'É preciso adicionar e aguardar o upload de uma imagem antes de realizar o cadastro.',
          status: 'error',
          duration: 9000,
          isClosable: true,
          position: 'top-right',
        });

        return;
      }

      await mutation.mutateAsync({
        title: data.title,
        description: data.description,
        url: imageUrl,
      });

      toast({
        title: 'Imagem cadastrada',
        description: 'Sua imagem foi cadastrada com sucesso.',
        status: 'success',
        duration: 9000,
        isClosable: true,
        position: 'top-right',
      });
    } catch {
      toast({
        title: 'Falha no cadastro',
        description: 'Ocorreu um erro ao tentar cadastrar a sua imagem.',
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      mutation.reset();
      reset();
      setImageUrl('');
      setLocalImageUrl('');
      closeModal();
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          error={errors.image}
          {...register('image')}
        />

        <TextInput
          placeholder="Título da imagem..."
          error={errors.title}
          {...register('title')}
        />

        <TextInput
          placeholder="Descrição da imagem..."
          error={errors.description}
          {...register('description')}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
