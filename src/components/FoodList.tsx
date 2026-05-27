import { useState, useCallback } from 'react'
import type { Food, MealType } from '../types'
import { MEAL_LABELS, MEAL_EMOJIS, MEAL_TYPES, CUISINE_OPTIONS } from '../types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface FoodListProps {
  foods: Food[]
  onDelete: (id: string) => void
  onReorder: (foods: Food[]) => void
  onEdit: (food: Food) => void
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" className={`star ${i <= value ? 'filled' : ''}`} onClick={() => onChange(i)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={i <= value ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  )
}

function SortableFoodCard({ food, onDelete, onEdit }: { food: Food; onDelete: (id: string) => void; onEdit: (food: Food) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: food.id })
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(food.name)
  const [editMealTypes, setEditMealTypes] = useState<MealType[]>(food.mealTypes)
  const [editCuisine, setEditCuisine] = useState(food.cuisine)
  const [editRating, setEditRating] = useState(food.rating)
  const [editComment, setEditComment] = useState(food.comment ?? '')

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  }

  const handleClickDelete = useCallback(() => {
    onDelete(food.id)
  }, [food.id, onDelete])

  function startEdit() {
    setEditName(food.name)
    setEditMealTypes(food.mealTypes)
    setEditCuisine(food.cuisine)
    setEditRating(food.rating)
    setEditComment(food.comment ?? '')
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
  }

  function saveEdit() {
    if (!editName.trim() || editMealTypes.length === 0) return
    onEdit({
      ...food,
      name: editName.trim(),
      mealTypes: editMealTypes,
      cuisine: editCuisine,
      rating: editRating,
      comment: editComment.trim() || undefined,
    })
    setEditing(false)
  }

  function toggleMealType(m: MealType) {
    setEditMealTypes(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    )
  }

  if (editing) {
    return (
      <div ref={setNodeRef} style={style}>
        <div className="food-card editing">
          <form className="edit-form" onSubmit={e => { e.preventDefault(); saveEdit() }}>
            <div className="ff-field">
              <input
                className="ff-name-input"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Food name"
                autoFocus
              />
            </div>
            <div className="ff-field">
              <label className="ff-label">Meal</label>
              <div className="chip-group">
                {MEAL_TYPES.map(m => (
                  <button type="button" key={m} className={`chip ${editMealTypes.includes(m) ? 'active' : ''}`} onClick={() => toggleMealType(m)}>
                    {MEAL_EMOJIS[m]} {MEAL_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>
            <div className="ff-field">
              <label className="ff-label">Cuisine <span className="ff-optional">(optional)</span></label>
              <select value={editCuisine} onChange={e => setEditCuisine(e.target.value)}>
                <option value="">Any</option>
                {CUISINE_OPTIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="ff-field">
              <label className="ff-label">Rating</label>
              <StarRating value={editRating} onChange={setEditRating} />
            </div>
            <div className="ff-field">
              <label className="ff-label">Comment <span className="ff-optional">(optional)</span></label>
              <input
                className="ff-comment-input"
                value={editComment}
                onChange={e => setEditComment(e.target.value)}
                placeholder="e.g. Best with extra sauce"
              />
            </div>
            <div className="edit-actions">
              <button type="submit" className="btn-confirm" disabled={!editName.trim() || editMealTypes.length === 0}>Save</button>
              <button type="button" className="btn-secondary" onClick={cancelEdit}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div className="food-card">
        <div className="food-card-header">
          <div className="food-card-header-left">
            <button className="drag-handle" {...attributes} {...listeners} aria-label="Drag to reorder">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="5" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="19" r="1" />
              </svg>
            </button>
            <span className="food-name">{food.name}</span>
          </div>
          <div className="food-card-header-actions">
            <button className="btn-icon" onClick={startEdit} title="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button className="btn-icon" onClick={handleClickDelete} title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
        </div>
        <div className="food-card-details">
          <div className="detail-row">
            <span>{food.mealTypes.map(m => `${MEAL_EMOJIS[m]} ${MEAL_LABELS[m]}`).join(' · ')}</span>
          </div>
          {food.cuisine && (
            <div className="detail-row">
              <span className="detail-label">Cuisine:</span>
              <span>{food.cuisine}</span>
            </div>
          )}
          <div className="detail-row stars-row">
            {[1, 2, 3, 4, 5].map(i => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= food.rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          {food.comment && (
            <div className="detail-row food-comment">
              <span className="detail-label">Note:</span>
              <span>{food.comment}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function FoodList({ foods, onDelete, onReorder, onEdit }: FoodListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = foods.findIndex(f => f.id === active.id)
    const newIndex = foods.findIndex(f => f.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const updated = [...foods]
    const [moved] = updated.splice(oldIndex, 1)
    updated.splice(newIndex, 0, moved)
    onReorder(updated)
  }

  if (foods.length === 0) {
    return (
      <div className="food-list">
        <h2>My Foods</h2>
        <p className="empty-state">No foods yet. Add some!</p>
      </div>
    )
  }

  return (
    <div className="food-list">
      <h2>My Foods ({foods.length})</h2>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={foods.map(f => f.id)} strategy={verticalListSortingStrategy}>
          <div className="food-grid">
            {foods.map(f => (
              <SortableFoodCard key={f.id} food={f} onDelete={onDelete} onEdit={onEdit} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}