import { useState, useEffect } from 'react'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { CheckCircle2, XCircle, Loader2, Terminal, Anvil, ArrowRight } from 'lucide-react'
import { api } from '@/api'
import type { SetupStatus } from '@/api/modules/setup'

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--studio-bg-main);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.3s ease;
`

const Card = styled.div`
  width: 440px;
  background: var(--studio-bg-sidebar);
  border: 1px solid var(--studio-border);
  border-radius: 20px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 32px 20px;
`

const LogoWrap = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--studio-accent);
  display: flex;
  align-items: center;
  justify-content: center;
`

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--studio-text-primary);
  letter-spacing: -0.02em;
  text-align: center;
`

const Subtitle = styled.p`
  font-size: 13px;
  color: var(--studio-text-tertiary);
  text-align: center;
  line-height: 1.5;
`

const Body = styled.div`
  padding: 0 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const CheckRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
`

const CheckInfo = styled.div`
  flex: 1;
`

const CheckLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--studio-text-primary);
`

const CheckMeta = styled.div`
  font-size: 11px;
  color: var(--studio-text-muted);
  margin-top: 1px;
`

const CheckError = styled.div`
  font-size: 11px;
  color: var(--studio-error);
  margin-top: 2px;
`

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`

const Spinner = styled(Loader2)`
  animation: ${spin} 0.8s linear infinite;
  color: var(--studio-text-muted);
  flex-shrink: 0;
`

const ActionRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`

const PrimaryBtn = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.12s ease;

  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: default; }
`

const SecondaryBtn = styled.button`
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  color: var(--studio-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;

  &:hover {
    background: var(--studio-bg-surface);
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }
`

const CodeBlock = styled.div`
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, monospace;
  font-size: 12px;
  color: var(--studio-text-primary);
  margin-top: 4px;
  user-select: all;
`

const StepDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 16px 0;
`

const Dot = styled.div<{ active: boolean; done: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ active, done }) =>
    done ? 'var(--studio-accent)' : active ? 'var(--studio-text-secondary)' : 'var(--studio-border)'};
  transition: background 0.2s ease;
`

/* ── Component ── */

type Step = 'checking' | 'prerequisites' | 'auth' | 'ready'

interface SetupWizardProps {
  onComplete: () => void
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState<Step>('checking')
  const [status, setStatus] = useState<SetupStatus | null>(null)
  const [installing, setInstalling] = useState(false)
  const [installError, setInstallError] = useState<string | null>(null)

  const runCheck = async () => {
    setStep('checking')
    const result = await api.setup.check()
    setStatus(result)

    if (!result.node.installed || !result.claude.installed) {
      setStep('prerequisites')
    } else if (!result.auth.authenticated) {
      setStep('auth')
    } else {
      setStep('ready')
    }
  }

  useEffect(() => {
    runCheck()
  }, [])

  const handleInstallClaude = async () => {
    setInstalling(true)
    setInstallError(null)
    const result = await api.setup.installClaude()
    setInstalling(false)
    if (result.success) {
      runCheck()
    } else {
      setInstallError(result.error || 'Installation failed')
    }
  }

  const handleAuthDone = () => {
    runCheck()
  }

  const stepIndex = step === 'checking' ? 0 : step === 'prerequisites' ? 0 : step === 'auth' ? 1 : 2

  return (
    <Overlay>
      <Card>
        <Header>
          <LogoWrap>
            <Anvil size={22} color="var(--studio-accent-fg)" />
          </LogoWrap>
          <Title>
            {step === 'checking' && 'Checking prerequisites...'}
            {step === 'prerequisites' && 'Setup Required'}
            {step === 'auth' && 'Authenticate with Claude'}
            {step === 'ready' && 'Ready to go!'}
          </Title>
          <Subtitle>
            {step === 'checking' && 'Verifying your development environment.'}
            {step === 'prerequisites' && 'Some dependencies need to be installed.'}
            {step === 'auth' && 'Sign in to Claude to start building.'}
            {step === 'ready' && 'Your environment is all set up.'}
          </Subtitle>
        </Header>

        <Body>
          {step === 'checking' && (
            <CheckRow>
              <Spinner size={18} />
              <CheckInfo>
                <CheckLabel>Checking environment...</CheckLabel>
              </CheckInfo>
            </CheckRow>
          )}

          {step === 'prerequisites' && status && (
            <>
              <CheckRow>
                {status.node.installed
                  ? <CheckCircle2 size={18} style={{ color: 'var(--studio-accent)', flexShrink: 0 }} />
                  : <XCircle size={18} style={{ color: 'var(--studio-error)', flexShrink: 0 }} />
                }
                <CheckInfo>
                  <CheckLabel>Node.js (v18+)</CheckLabel>
                  <CheckMeta>
                    {status.node.installed
                      ? `${status.node.version} installed`
                      : status.node.version
                        ? `${status.node.version} found — v18+ required`
                        : 'Not found'}
                  </CheckMeta>
                  {!status.node.installed && (
                    <CheckMeta style={{ marginTop: 4 }}>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); window.open('https://nodejs.org') }}
                        style={{ color: 'var(--studio-link)', textDecoration: 'none' }}
                      >
                        Download from nodejs.org
                      </a>
                    </CheckMeta>
                  )}
                </CheckInfo>
              </CheckRow>

              <CheckRow>
                {status.claude.installed
                  ? <CheckCircle2 size={18} style={{ color: 'var(--studio-accent)', flexShrink: 0 }} />
                  : installing
                    ? <Spinner size={18} />
                    : <XCircle size={18} style={{ color: 'var(--studio-error)', flexShrink: 0 }} />
                }
                <CheckInfo>
                  <CheckLabel>Claude Code CLI</CheckLabel>
                  <CheckMeta>
                    {status.claude.installed
                      ? `${status.claude.version} installed`
                      : installing
                        ? 'Installing...'
                        : 'Required for AI features'}
                  </CheckMeta>
                  {!status.claude.installed && !installing && (
                    <CodeBlock style={{ marginTop: 6 }}>npm install -g @anthropic-ai/claude-code</CodeBlock>
                  )}
                  {installError && <CheckError>{installError}</CheckError>}
                </CheckInfo>
              </CheckRow>

              <ActionRow>
                {!status.node.installed && !status.claude.installed && (
                  <SecondaryBtn onClick={() => runCheck()}>
                    Re-check
                  </SecondaryBtn>
                )}
                {!status.claude.installed && !installing && status.node.installed && (
                  <PrimaryBtn onClick={handleInstallClaude}>
                    <Terminal size={14} />
                    Install Claude Code
                  </PrimaryBtn>
                )}
                {!status.claude.installed && !installing && (
                  <SecondaryBtn onClick={() => runCheck()}>
                    Re-check
                  </SecondaryBtn>
                )}
                {status.claude.installed && status.node.installed && (
                  <PrimaryBtn onClick={() => runCheck()}>
                    Continue
                    <ArrowRight size={14} />
                  </PrimaryBtn>
                )}
              </ActionRow>
            </>
          )}

          {step === 'auth' && (
            <>
              <CheckRow>
                <CheckCircle2 size={18} style={{ color: 'var(--studio-accent)', flexShrink: 0 }} />
                <CheckInfo>
                  <CheckLabel>Node.js</CheckLabel>
                  <CheckMeta>{status?.node.version}</CheckMeta>
                </CheckInfo>
              </CheckRow>

              <CheckRow>
                <CheckCircle2 size={18} style={{ color: 'var(--studio-accent)', flexShrink: 0 }} />
                <CheckInfo>
                  <CheckLabel>Claude Code CLI</CheckLabel>
                  <CheckMeta>{status?.claude.version}</CheckMeta>
                </CheckInfo>
              </CheckRow>

              <CheckRow>
                <XCircle size={18} style={{ color: 'var(--studio-error)', flexShrink: 0 }} />
                <CheckInfo>
                  <CheckLabel>Authentication</CheckLabel>
                  <CheckMeta>Run this in your terminal to sign in:</CheckMeta>
                  <CodeBlock>claude login</CodeBlock>
                </CheckInfo>
              </CheckRow>

              <ActionRow>
                <PrimaryBtn onClick={handleAuthDone}>
                  I've authenticated
                </PrimaryBtn>
                <SecondaryBtn onClick={onComplete}>
                  Skip
                </SecondaryBtn>
              </ActionRow>
            </>
          )}

          {step === 'ready' && status && (
            <>
              <CheckRow>
                <CheckCircle2 size={18} style={{ color: 'var(--studio-accent)', flexShrink: 0 }} />
                <CheckInfo>
                  <CheckLabel>Node.js</CheckLabel>
                  <CheckMeta>{status.node.version}</CheckMeta>
                </CheckInfo>
              </CheckRow>

              <CheckRow>
                <CheckCircle2 size={18} style={{ color: 'var(--studio-accent)', flexShrink: 0 }} />
                <CheckInfo>
                  <CheckLabel>Claude Code CLI</CheckLabel>
                  <CheckMeta>{status.claude.version}</CheckMeta>
                </CheckInfo>
              </CheckRow>

              <CheckRow>
                <CheckCircle2 size={18} style={{ color: 'var(--studio-accent)', flexShrink: 0 }} />
                <CheckInfo>
                  <CheckLabel>Authenticated</CheckLabel>
                  <CheckMeta>Ready to use Claude</CheckMeta>
                </CheckInfo>
              </CheckRow>

              <ActionRow>
                <PrimaryBtn onClick={onComplete}>
                  Get Started
                  <ArrowRight size={14} />
                </PrimaryBtn>
              </ActionRow>
            </>
          )}
        </Body>

        <StepDots>
          <Dot active={stepIndex === 0} done={stepIndex > 0} />
          <Dot active={stepIndex === 1} done={stepIndex > 1} />
          <Dot active={stepIndex === 2} done={false} />
        </StepDots>
      </Card>
    </Overlay>
  )
}
