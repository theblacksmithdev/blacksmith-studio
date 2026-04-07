import { Box, HStack } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { NavRail } from './nav-rail'
import { TitleBar } from './title-bar'

export function StudioLayout() {
  return (
    <Box display="flex" flexDir="column" h="100vh">
      <TitleBar />
      <HStack flex={1} gap={0} align="stretch" minH={0}>
        <NavRail />
        <Box flex={1} display="flex" flexDir="column" minW={0} overflow="hidden">
          <Outlet />
        </Box>
      </HStack>
    </Box>
  )
}
