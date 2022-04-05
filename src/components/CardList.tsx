import { SimpleGrid, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';
import { Card } from './Card';
import { ModalViewImage } from './Modal/ViewImage';

interface Card {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
}

interface CardsProps {
  cards: Card[];
}

export function CardList({ cards }: CardsProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  function openImage(url: string): void {
    setImageUrl(url);
    onOpen();
  }

  return (
    <>
      <SimpleGrid columns={[2, 2, 2, 3]} spacing="40px">
        {cards.map(img => (
          <Card data={img} key={img.id} viewImage={() => openImage(img.url)} />
        ))}
      </SimpleGrid>

      <ModalViewImage isOpen={isOpen} imgUrl={imageUrl} onClose={onClose} />
    </>
  );
}
