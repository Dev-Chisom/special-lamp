/**
 * Template renderers for different resume templates
 * Each template has its own rendering logic
 */

import React from 'react'
import type { ResumeData } from './resume-data-utils'

interface TemplateRendererProps {
  data: ResumeData
  templateId: string
}

/**
 * Classic Professional Template
 * Traditional, clean design with clear sections
 */
export function ClassicProfessionalTemplate({ data }: TemplateRendererProps) {
  return (
    <div className="bg-white text-gray-900 p-8 text-sm leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {data.personalInfo.firstName} {data.personalInfo.lastName}
        </h1>
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
          {data.personalInfo.linkedin && <span>• {data.personalInfo.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 border-b border-gray-400 pb-1">PROFESSIONAL SUMMARY</h2>
          <p className="text-justify">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 border-b border-gray-400 pb-1">PROFESSIONAL EXPERIENCE</h2>
          <div className="space-y-4">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold text-base">{exp.jobTitle}</h3>
                    <p className="text-gray-700">{exp.company}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-700">
                      {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>
                </div>
                {exp.description && (
                  <div className="mt-2 text-gray-800 whitespace-pre-line">{exp.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 border-b border-gray-400 pb-1">EDUCATION</h2>
          <div className="space-y-3">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{edu.degree}</h3>
                    <p className="text-gray-700">{edu.school}</p>
                  </div>
                  <span className="text-gray-700">
                    {edu.startYear} - {edu.isCurrent ? 'Present' : edu.endYear}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-3 border-b border-gray-400 pb-1">SKILLS</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, idx) => (
              <span key={idx} className="bg-gray-100 px-3 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Modern Professional Template
 * Contemporary design with subtle colors
 */
export function ModernProfessionalTemplate({ data }: TemplateRendererProps) {
  return (
    <div className="bg-white text-gray-900 p-8 text-sm leading-relaxed">
      {/* Header with accent */}
      <div className="bg-blue-600 text-white p-6 mb-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">
          {data.personalInfo.firstName} {data.personalInfo.lastName}
        </h1>
        <div className="flex flex-wrap gap-3 text-blue-100">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
          {data.personalInfo.linkedin && <span>• {data.personalInfo.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-6 pl-4 border-l-4 border-blue-600">
          <h2 className="text-lg font-semibold mb-2 text-blue-600">Summary</h2>
          <p className="text-gray-700">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-blue-600 border-b-2 border-blue-600 pb-1">Experience</h2>
          <div className="space-y-4">
            {data.experience.map((exp) => (
              <div key={exp.id} className="pl-4 border-l-2 border-gray-300">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold text-base">{exp.jobTitle}</h3>
                    <p className="text-blue-600">{exp.company}</p>
                  </div>
                  <span className="text-gray-600 text-xs">
                    {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.description && (
                  <div className="mt-2 text-gray-700 whitespace-pre-line text-xs">{exp.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-blue-600 border-b-2 border-blue-600 pb-1">Education</h2>
          <div className="space-y-3">
            {data.education.map((edu) => (
              <div key={edu.id} className="pl-4 border-l-2 border-gray-300">
                <h3 className="font-semibold">{edu.degree}</h3>
                <p className="text-blue-600">{edu.school}</p>
                <span className="text-gray-600 text-xs">
                  {edu.startYear} - {edu.isCurrent ? 'Present' : edu.endYear}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-blue-600 border-b-2 border-blue-600 pb-1">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, idx) => (
              <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Minimalist Expert Template
 * Clean and minimal, emphasizes content
 */
export function MinimalistExpertTemplate({ data }: TemplateRendererProps) {
  return (
    <div className="bg-white text-gray-900 p-10 text-sm leading-relaxed" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Header - Minimal */}
      <div className="mb-8">
        <h1 className="text-4xl font-light mb-2 tracking-wide">
          {data.personalInfo.firstName} {data.personalInfo.lastName}
        </h1>
        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>|</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>|</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          {data.personalInfo.linkedin && <span>|</span>}
          {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4 text-gray-500">Experience</h2>
          <div className="space-y-6">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-base">{exp.jobTitle}</h3>
                    <p className="text-gray-600 text-xs">{exp.company}</p>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.description && (
                  <div className="mt-2 text-gray-700 text-xs leading-relaxed whitespace-pre-line">{exp.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4 text-gray-500">Education</h2>
          <div className="space-y-4">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <h3 className="font-medium">{edu.degree}</h3>
                <p className="text-gray-600 text-xs">{edu.school}</p>
                <span className="text-gray-500 text-xs">
                  {edu.startYear} - {edu.isCurrent ? 'Present' : edu.endYear}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4 text-gray-500">Skills</h2>
          <div className="flex flex-wrap gap-3">
            {data.skills.map((skill, idx) => (
              <span key={idx} className="text-gray-700 text-xs">
                {skill}
                {idx < data.skills.length - 1 && <span className="mx-1">•</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Get the appropriate template renderer component
 */
export function getTemplateRenderer(templateId: string): React.ComponentType<TemplateRendererProps> {
  const renderers: Record<string, React.ComponentType<TemplateRendererProps>> = {
    'classic-professional': ClassicProfessionalTemplate,
    'modern-professional': ModernProfessionalTemplate,
    'modern-student': ModernProfessionalTemplate, // Reuse for now
    'minimalist-expert': MinimalistExpertTemplate,
    'timeless-professional': ClassicProfessionalTemplate, // Reuse for now
  }

  return renderers[templateId] || ClassicProfessionalTemplate
}

