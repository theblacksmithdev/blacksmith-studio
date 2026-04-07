import styled from '@emotion/styled'
import { Outlet } from 'react-router-dom'
import { AppTitleBar } from './title-bar'

const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`

export function AppLayout() {
  return (
    <Root>
      <AppTitleBar />
      <Content>
        <Outlet />
      </Content>
    </Root>
  )
}
