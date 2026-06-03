import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Activity } from '../types/activity'
import type { Lead, LeadStatus } from '../types/lead'
import type { LeadCrmAction } from '../types/leadOperations'
import {
  createActivity,
  seedActivitiesFromLeads,
  sortActivitiesNewestFirst,
} from '../utils/activities'
import {
  clearActivitiesStorage,
  loadActivitiesFromStorage,
  saveActivitiesToStorage,
} from '../utils/activityStorage'
import { createLeadFromForm, type LeadFormData } from '../utils/leadForm'
import { applyLeadAction, moveLeadToStatus } from '../utils/leadOperations'
import {
  clearLeadsStorage,
  getDefaultLeads,
  loadLeadsFromStorage,
  saveLeadsToStorage,
} from '../utils/leadStorage'
import { deriveTasksFromLeads } from '../utils/tasks'
import {
  clearTaskCompletionsStorage,
  loadTaskCompletionsFromStorage,
  saveTaskCompletionsToStorage,
  type TaskCompletionMap,
} from '../utils/taskStorage'

function loadInitialActivities(leads: Lead[]): Activity[] {
  const stored = loadActivitiesFromStorage()
  if (stored) return stored
  return seedActivitiesFromLeads(leads)
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>(() => loadLeadsFromStorage())
  const [activities, setActivities] = useState<Activity[]>(() =>
    loadInitialActivities(loadLeadsFromStorage()),
  )
  const [taskCompletions, setTaskCompletions] = useState<TaskCompletionMap>(() =>
    loadTaskCompletionsFromStorage(),
  )

  const tasks = useMemo(
    () => deriveTasksFromLeads(leads, taskCompletions),
    [leads, taskCompletions],
  )

  useEffect(() => {
    saveLeadsToStorage(leads)
  }, [leads])

  useEffect(() => {
    saveActivitiesToStorage(activities)
  }, [activities])

  useEffect(() => {
    saveTaskCompletionsToStorage(taskCompletions)
  }, [taskCompletions])

  const addLeadFromForm = useCallback((formData: LeadFormData): Lead => {
    let newLead!: Lead

    setLeads((currentLeads) => {
      newLead = createLeadFromForm(formData, currentLeads)
      return [newLead, ...currentLeads]
    })

    setActivities((currentActivities) =>
      sortActivitiesNewestFirst([
        createActivity({
          leadId: newLead.id,
          leadName: newLead.name,
          type: 'lead_created',
          message: `${newLead.name} submitted a ${newLead.serviceInterest.toLowerCase()} inquiry.`,
        }),
        ...currentActivities,
      ]),
    )

    return newLead
  }, [])

  const performLeadAction = useCallback(
    (leadId: string, action: LeadCrmAction): Lead | null => {
      const lead = leads.find((entry) => entry.id === leadId)
      if (!lead) return null

      const result = applyLeadAction(lead, action)

      setLeads((currentLeads) =>
        currentLeads.map((entry) => (entry.id === leadId ? result.updatedLead : entry)),
      )
      setActivities((currentActivities) =>
        sortActivitiesNewestFirst([...result.activities, ...currentActivities]),
      )

      return result.updatedLead
    },
    [leads],
  )

  const moveLeadStatus = useCallback(
    (leadId: string, targetStatus: LeadStatus): Lead | null => {
      const lead = leads.find((entry) => entry.id === leadId)
      if (!lead) return null

      const result = moveLeadToStatus(lead, targetStatus)
      if (result.activities.length === 0) return lead

      setLeads((currentLeads) =>
        currentLeads.map((entry) => (entry.id === leadId ? result.updatedLead : entry)),
      )
      setActivities((currentActivities) =>
        sortActivitiesNewestFirst([...result.activities, ...currentActivities]),
      )

      return result.updatedLead
    },
    [leads],
  )

  const toggleTaskComplete = useCallback((taskId: string) => {
    setTaskCompletions((current) => {
      const existing = current[taskId]
      const nextCompleted = !(existing?.completed ?? false)

      return {
        ...current,
        [taskId]: {
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : null,
        },
      }
    })
  }, [])

  const resetDemoData = useCallback((): Lead[] => {
    const restored = getDefaultLeads()
    clearLeadsStorage()
    clearActivitiesStorage()
    clearTaskCompletionsStorage()
    setLeads(restored)
    setActivities(seedActivitiesFromLeads(restored))
    setTaskCompletions({})
    saveLeadsToStorage(restored)
    return restored
  }, [])

  return {
    leads,
    activities,
    tasks,
    addLeadFromForm,
    performLeadAction,
    moveLeadStatus,
    toggleTaskComplete,
    resetDemoData,
  }
}
