import styled from "@emotion/styled";

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

export const Body = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`;

export const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
`;

export const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;
