import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Card from './Card';
import { deleteTodo, updateTodo } from '../store/slices/todoSlice';
import { updateSectionName } from '../store/slices/sectionsSlice';
import { toast } from 'react-toastify';

const TaskColumn = ({ filter, sections, handleSectionDragStart, setSectionDropIndex, setDragCardIndex, dragCardIndex }) => {

  const [editingSection, setEditingSection] = useState(null);
  const [tempTitle, setTempTitle] = useState("");
  const { todoList, isLoading } = useSelector((state) => state.todos);
  const { userList } = useSelector(
    (state) => state.users
  );
  const ticketStages = useMemo(
    () => sections.sections.map((section) => section.sectionId),
    [sections]
  );
  const dispatch = useDispatch();


  const allowDrop = (e) => {
    e.preventDefault();
  };

  // const handleDrop = (section) => {
  //   const { order } = section
  //   setSectionDropIndex(order)

  //   if (dragCardIndex === null) return;

  //   const task = todoList[dragCardIndex];

  //   const nextStep = ticketStages.indexOf(section?.sectionId);

  //   dispatch(updateTodo({ sectionId: task.sectionId, updates: { sectionId: section.sectionId, currentStep: nextStep } }));
  //   setDragCardIndex(null);
  // };

  // const handleSectionTitleChange = (order, newTitle) => {
  //   dispatch(updateSectionName({ id: order, status: newTitle }));
  // };

  const handleDrop = (section) => {
    const { order } = section;
    setSectionDropIndex(order);

    if (dragCardIndex === null) return;

    const task = todoList[dragCardIndex];
    const nextStep = ticketStages.indexOf(section?.sectionId);

    dispatch(
      updateTodo({
        taskId: task.id,
        updates: { sectionId: section.sectionId, currentStep: nextStep },
      })
    );

    setDragCardIndex(null);
  };


  // const moveTaskStep = (section, index, direction) => {
  //   const task = todoList[index];
  //   if (!task) return;

  //   const currentStep = ticketStages.indexOf(task.sectionId);
  //   const newStep = currentStep + direction;
  //   console.log('newStep :>> ', newStep);
  //   if (newStep >= 0 && newStep < ticketStages.length) {
  //     dispatch(
  //       updateTodo({
  //         sectionId: task.sectionId,
  //         updates: {
  //           sectionId: section.sectionId,
  //           currentStep: newStep,
  //         },
  //       })
  //     );
  //   }
  // };

  const moveTaskStep = (section, index, direction) => {
    const task = todoList[index];
    if (!task) return;

    const currentStep = ticketStages.indexOf(task.sectionId);
    const newStep = currentStep + direction;

    if (newStep >= 0 && newStep < ticketStages.length) {
      const newSectionId = ticketStages[newStep];
      dispatch(
        updateTodo({
          taskId: task.id,
          updates: {
            sectionId: newSectionId,
            currentStep: newStep,
          },
        })
      );
    }
  };

  const handleDragStart = (index) => setDragCardIndex(index);

  const handleDelete = (id) => {
    try {
      dispatch(deleteTodo(id))
    } catch (error) {
      toast.error("Failed to delete task")
    }
  }

  const handleInlineUpdate = (index, field, value) => {
    const task = todoList[index];
    if (!task || task[field] === value) return;

    try {
      dispatch(
        updateTodo({
          taskId: task.id,
          updates: {
            [field]: value,
          },
        })
      );
      toast.success("Task updated successfully");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const filteredTodos =
    filter !== "All"
      ? todoList.filter((item) => item.assignedTo === filter)
      : todoList;

  const tasksByStatus = ticketStages.reduce((acc, sectionId) => {
    acc[sectionId] = filteredTodos.filter((item) => item.sectionId === sectionId);
    return acc;
  }, {});

  return (
    <>
      {sections.sections?.map((section) => (
        <div
          draggable
          onDragStart={() => handleSectionDragStart(section.order)}
          key={section.status}
          onDragOver={allowDrop}
          onDrop={() => handleDrop(section)}
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
                    handleSectionTitleChange(section.id, tempTitle);
                  }
                  setEditingSection(null);
                }}
                autoFocus
              />
            ) : (
              <span
                className="text-lg cursor-pointer"
                onClick={() => {
                  setEditingSection(section.order);
                  setTempTitle(section.status);
                }}
              >
                {section.status}
              </span>
            )}

            <span className="text-sm bg-white text-gray-600 px-2 py-0.5 rounded-full shadow-sm ml-3">
              {tasksByStatus[section.sectionId]?.length || 0}
            </span>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
            {isLoading ? (
              Array(3).fill(null).map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-200 animate-pulse rounded-lg"
                ></div>
              ))
            ) : (
              tasksByStatus[section.sectionId].map((item) => {
                const assignedUser = userList.find(
                  (user) => user.id === item.assignedTo
                );
                return (
                  <Card
                    key={item.id}
                    title={item.title}
                    progress={item.status}
                    description={item.description}
                    handleDisable={item.currentStep}
                    AssignUserId={assignedUser?.uid
                    }
                    AssignUser={
                      assignedUser
                        ? `${assignedUser.firstName} ${assignedUser.lastName}`
                        : "Not Assigned"
                    }
                    onUpdate={(field, value) =>
                      handleInlineUpdate(todoList.indexOf(item), field, value)
                    }
                    handleDelete={() => handleDelete(item.id)}
                    handleNext={() => moveTaskStep(section, todoList.indexOf(item), 1)}
                    handlePrevious={() => moveTaskStep(section, todoList.indexOf(item), -1)}
                    onDragStart={() => handleDragStart(todoList.indexOf(item))}
                  />
                );
              })
            )}
          </div>
        </div >
      ))}
    </>
  )
}

export default TaskColumn
