import styled from 'styled-components';
import { Card } from 'antd';

export const Title = styled.div`
  font-size: 1.3em;
  display: flex;
  justify-content: space-between;
`;

export const CardContainer = styled(Card)`
  max-width: 400px;

  & .ant-card-actions {
    & li:first-child {
      width: 70% !important;
    }
    & li:last-child {
      width: 30% !important;
    }
  }
`;

export const PriceContainer = styled.div``;

export const VolumeContainer = styled.div`
`;
