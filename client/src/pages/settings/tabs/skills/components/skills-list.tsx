import styled from '@emotion/styled'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SkillRow } from './skill-row'
import type { SkillEntry } from '@/api/modules/skills'

const List = styled.div`
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  overflow: hidden;
  background: var(--studio-bg-sidebar);
`

const FooterLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 0;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
  transition: color 0.12s ease;
  &:hover { color: var(--studio-text-primary); }
`

interface SkillsListProps {
  skills: SkillEntry[]
  browsePath: string
  onEdit: (skill: SkillEntry) => void
  onDelete: (name: string) => void
}

export function SkillsList({ skills, browsePath, onEdit, onDelete }: SkillsListProps) {
  return (
    <>
      <List>
        {skills.map((skill) => (
          <SkillRow
            key={skill.name}
            skill={skill}
            onEdit={() => onEdit(skill)}
            onDelete={() => onDelete(skill.name)}
          />
        ))}
      </List>
      <FooterLink to={browsePath}>
        Browse library <ArrowRight size={11} />
      </FooterLink>
    </>
  )
}
