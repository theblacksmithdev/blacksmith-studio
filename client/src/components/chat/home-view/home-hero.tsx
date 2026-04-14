import styled from '@emotion/styled'
import { useProjectQuery } from '@/api/hooks/projects'
import { useActiveProjectId } from '@/api/hooks/_shared'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`

const Greeting = styled.h1`
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: var(--studio-text-primary);
  text-align: center;
  line-height: 1.2;
`

const ProjectName = styled.span`
  color: var(--studio-text-tertiary);
`

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function HomeHero() {
  const projectId = useActiveProjectId()
  const { data: project } = useProjectQuery(projectId)

  return (
    <Wrapper>
      <Greeting>
        {getGreeting()}
        {project && (
          <>
            ,{' '}
            <ProjectName>{project.name}</ProjectName>
          </>
        )}
      </Greeting>
    </Wrapper>
  )
}
