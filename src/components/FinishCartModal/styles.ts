import styled, {keyframes} from 'styled-components';

const fade = keyframes`
  from{
    opacity: 0
  }
  to{
    opacity: 1
  }
`;

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  animation: ${fade} 500ms;
`;
