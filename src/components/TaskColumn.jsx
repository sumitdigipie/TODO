import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Card from './Card';
import { updateTodo } from '../store/slices/todoSlice';

const TaskColumn = ({ filter, sections, handleSectionDragStart, setSectionDropIndex, setDragCardIndex, dragCardIndex }) => {

  const { todoList, isLoading } = useSelector((state) => state.todos);
  const { userList } = useSelector(
    (state) => state.users
  );
  const dispatch = useDispatch();

  const ticketStages = useMemo(
    () => sections.sections.map((section) => section.status),
    [sections]
  );

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const handleDrop = (section) => {
    const { status, order } = section
    setSectionDropIndex(order)
    if (dragCardIndex === null) return;
    const task = todoList[dragCardIndex];
    const currentStep = ticketStages.indexOf(status);
    dispatch(updateTodo({ id: task.id, updates: { status, currentStep } }));
    setDragCardIndex(null);
  };

  const moveTaskStep = (index, direction) => {
    const task = todoList[index];
    if (!task) return;

    const currentStep = ticketStages.indexOf(task.status);
    const newStep = currentStep + direction;

    if (newStep >= 0 && newStep < ticketStages.length) {
      dispatch(
        updateTodo({
          id: task.id,
          updates: {
            status: ticketStages[newStep],
            currentStep: newStep,
          },
        })
      );
    }
  };

  const handleDragStart = (index) => setDragCardIndex(index);

  const filteredTodos =
    filter !== "All"
      ? todoList.filter((item) => item.assignedTo === filter)
      : todoList;

  const tasksByStatus = ticketStages.reduce((acc, status) => {
    acc[status] = filteredTodos.filter((item) => item.status === status);
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
          <div className="p-4 border-b rounded-t-xl font-semibold bg-gray-100 text-gray-800 flex justify-between items-center">
            <span className="text-lg">{section.status}</span>
            <span className="text-sm bg-white text-gray-600 px-2 py-0.5 rounded-full shadow-sm">
              {tasksByStatus[section.status]?.length || 0}
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
              tasksByStatus[section.status].map((item) => {
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
                    handleDelete={() => handleDelete(todoList.indexOf(item))}
                    handleNext={() => moveTaskStep(todoList.indexOf(item), 1)}
                    handlePrevious={() => moveTaskStep(todoList.indexOf(item), -1)}
                    onDragStart={() => handleDragStart(todoList.indexOf(item))}
                  />
                );
              })
            )}
          </div>
        </div>
      ))}
    </>
  )
}

export default TaskColumn
