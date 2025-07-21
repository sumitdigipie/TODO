import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from './Card';
import { deleteTodo, updateTodo } from '../store/slices/todoSlice';
import { deleteSection, updateSectionName } from '../store/slices/sectionsSlice';
import { toast } from 'react-toastify';
import { Trash2 } from 'lucide-react';

const TaskColumn = ({
  filter,
  sections,
  handleSectionDragStart,
  handleSectionDrop,
  setDragCardIndex,
  dragCardIndex,
  dragType,
  setDragType,
  setIsModalOpen,
  setSectionId
}) => {
  const [editingSection, setEditingSection] = useState(null);
  const [tempTitle, setTempTitle] = useState('');
  const { todoList, isLoading } = useSelector((state) => state.todos);
  const { userList } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  const ticketStages = useMemo(
    () => sections.sections.map((section) => section.sectionId),
    [sections]
  );

  const filteredTodos =
    filter !== 'All'
      ? todoList.filter((item) => item.assignedTo === filter)
      : todoList;

  const tasksByStatus = ticketStages.reduce((acc, sectionId) => {
    acc[sectionId] = filteredTodos.filter((item) => item.sectionId === sectionId);
    return acc;
  }, {});

  const allowDrop = (e) => e.preventDefault();

  const handleDrop = async (section) => {
    if (dragCardIndex === null) return;

    const task = todoList[dragCardIndex];
    const nextStep = ticketStages.indexOf(section?.sectionId);

    await dispatch(
      updateTodo({
        taskId: task.id,
        updates: { sectionId: section.sectionId, currentStep: nextStep },
      })
    );

    setDragCardIndex(null);
    setDragType(null);
  };

  const handleDragStart = (index, e) => {
    e.stopPropagation();
    setDragCardIndex(index);
    setDragType('card');
  };

  const moveTaskStep = (index, direction) => {
    const task = todoList[index];
    const currentStep = ticketStages.indexOf(task.sectionId);
    const newStep = currentStep + direction;

    if (newStep >= 0 && newStep < ticketStages.length) {
      const newSectionId = ticketStages[newStep];
      dispatch(
        updateTodo({
          taskId: task.id,
          updates: { sectionId: newSectionId, currentStep: newStep },
        })
      );
    }
  };

  const handleDelete = (id) => {
    try {
      dispatch(deleteTodo(id));
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleSectionDelete = async (sectionId) => {
    await dispatch(deleteSection(sectionId));
  };

  const handleAddNewTask = (sectionDetails) => {
    const { sectionId } = sectionDetails
    setIsModalOpen(true)
    setSectionId(sectionId);
  }

  const handleInlineUpdate = (index, field, value) => {
    const task = todoList[index];
    if (!task || task[field] === value) return;

    try {
      dispatch(updateTodo({ taskId: task.id, updates: { [field]: value } }));
      toast.success('Task updated successfully');
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleSectionTitleChange = (sectionId, newTitle) => {
    dispatch(updateSectionName({ id: sectionId, status: newTitle }));
  };

  return (
    <div className="flex gap-4 items-start">
      {sections.sections?.map((section) => (
        <div
          key={section.status}
          draggable
          onDragStart={(e) => handleSectionDragStart(section.order, e)}
          onDragOver={allowDrop}
          onDrop={() =>
            dragType === 'section'
              ? handleSectionDrop(section.order)
              : handleDrop(section)
          }
          className="flex flex-col rounded-xl shadow-md hover:shadow-lg transition border min-w-[300px] w-full md:w-[320px] lg:w-[360px] bg-white"
        >
          <div className="p-4 border-b rounded-t-xl font-semibold bg-gray-100 text-gray-800 flex justify-between items-center h-[48px]">
            {editingSection === section.order ? (
              <input
                type="text"
                className="text-lg bg-white border rounded px-2 py-1 w-full h-[32px] truncate"
                style={{ minWidth: 0 }}
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={() => {
                  if (tempTitle.trim() && tempTitle !== section.status) {
                    handleSectionTitleChange(section.sectionId, tempTitle);
                  }
                  setEditingSection(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (tempTitle.trim() && tempTitle !== section.status) {
                      handleSectionTitleChange(section.sectionId, tempTitle);
                    }
                    setEditingSection(null);
                  }
                }}
                autoFocus
              />
            ) : (
              <span
                className="text-lg cursor-pointer truncate"
                onClick={() => {
                  setEditingSection(section.order);
                  setTempTitle(section.status);
                }}
              >
                {section.status}
              </span>
            )}
            <div className="ml-3 flex items-center">
              <button
                className="text-gray-500 hover:text-red-600"
                onClick={() => handleSectionDelete(section.sectionId)}
                title="Delete Section"
              >
                <Trash2 size={18} />
              </button>
              <span className="text-sm bg-white text-gray-600 px-2 py-0.5 rounded-full shadow-sm ml-3">
                {tasksByStatus[section.sectionId]?.length || 0}
              </span>
            </div>
          </div>

          <div
            className={`p-4 space-y-4 overflow-y-auto custom-scrollbar ${tasksByStatus[section.sectionId]?.length ? 'max-h-[70vh]' : ''
              }`}
          >
            {isLoading ? (
              Array(3)
                .fill(null)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-gray-200 animate-pulse rounded-lg"
                  ></div>
                ))
            ) : (
              <>
                {tasksByStatus[section.sectionId].map((item) => {
                  const assignedUser = userList.find(
                    (user) => user.id === item.assignedTo
                  );
                  return (
                    <Card
                      key={item.id}
                      title={item.title}
                      progress={item.sectionId}
                      description={item.description}
                      AssignUserId={assignedUser?.uid}
                      AssignUser={
                        assignedUser
                          ? `${assignedUser.firstName} ${assignedUser.lastName}`
                          : 'Not Assigned'
                      }
                      onUpdate={(field, value) =>
                        handleInlineUpdate(todoList.indexOf(item), field, value)
                      }
                      handleDelete={() => handleDelete(item.id)}
                      handleNext={() => moveTaskStep(todoList.indexOf(item), 1)}
                      handlePrevious={() =>
                        moveTaskStep(todoList.indexOf(item), -1)
                      }
                      onDragStart={(e) =>
                        handleDragStart(todoList.indexOf(item), e)
                      }
                      sections={sections.sections}
                    />

                  );
                })}
                <button
                  onClick={() => handleAddNewTask(section)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 mt-4 text-sm font-medium text-white bg-[#92959c] hover:bg-blue-700 transition duration-150 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <span className="text-lg font-bold">+</span> Add Task
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskColumn;
