import { TitleBarShell, TitleText } from './title-bar-shell'

export function AppTitleBar() {
  return (
    <TitleBarShell
      center={<TitleText>Blacksmith Studio</TitleText>}
    />
  )
}
