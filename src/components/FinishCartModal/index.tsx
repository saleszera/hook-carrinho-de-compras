import Modal from 'react-modal';
import {FiThumbsUp} from 'react-icons/fi'

import {Container} from './styles';

interface FinishCartModalProps{
  isModalOpen: boolean;
  onRequestClose: () => void;
}

export function FinishCartModal({isModalOpen, onRequestClose}: FinishCartModalProps){
  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={onRequestClose}
      overlayClassName="react-modal-overlay"
      className="react-modal-content"
    >
      <Container>
        <FiThumbsUp size={60} color='#FFFF'/>
      </Container>

    </Modal>
  )
}