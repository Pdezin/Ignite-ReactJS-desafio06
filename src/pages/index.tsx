import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

interface Page {
  after: string;
  data: {
    title: string;
    description: string;
    url: string;
    ts: number;
    id: string;
  }[];
}

export default function Home(): JSX.Element {
  const fetchImages = ({ pageParam = 0 }): Promise<Page> => {
    return api
      .get('/api/images', {
        params: {
          after: pageParam,
        },
      })
      .then(response => response.data);
  };

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery('images', fetchImages, {
    getNextPageParam: ({ after }) => after,
  });

  const formattedData = useMemo(() => {
    return data?.pages?.flatMap((item: Page) => [...item.data]);
  }, [data]);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />

        {hasNextPage && (
          <Button
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            my="8"
          >
            {isFetchingNextPage || isLoading
              ? 'Carregando...'
              : 'Carregar mais'}
          </Button>
        )}
      </Box>
    </>
  );
}
