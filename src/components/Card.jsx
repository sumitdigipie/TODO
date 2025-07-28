import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "../store/slices/userSlice";
import TicketDetailsDrawer from "./TicketDetailsDrawer";

const Card = ({
  title,
  taskId,
  AssignUser,
  handleDelete,
  progress,
  handleNext,
  handlePrevious,
  onDragStart,
  setIsDrawerOpen,
  setTaskInfoId,
  isDrawerOpen
}) => {

  const { currentUserData } = useSelector((state) => state.users);
  const sections = useSelector((state) => state.sections);
  const dispatch = useDispatch();

  let sectionLength = sections?.sections?.length;
  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const sectionOrderIndex = sections?.sections?.findIndex(
    (s) => s.sectionId === progress
  );

  const canEdit =
    currentUserData?.role === "Admin" || currentUserData?.role === "Manager";

  return (
    <>
      <div
        draggable={!isDrawerOpen}
        onDragStart={onDragStart}
        className={`bg-[#f9f8fc] border-b-[#ddd6f3] border-2 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-4 sm:p-5 w-full max-w-full`}
      >
        <div
          onClick={() => {
            setTaskInfoId(taskId)
            setIsDrawerOpen(true);
          }}
          className="cursor-pointer"
        >
          <h1 className="text-lg sm:text-xl text-gray-800 font-semibold break-words truncate">
            {title}
          </h1>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-500">Assigned to:</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-semibold text-[10px] shadow-sm uppercase">
                {AssignUser?.split(" ").map((name) => name[0]).join("")}
              </div>
              <span className="text-sm font-medium text-gray-800 break-words">{AssignUser}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canEdit && (
              <button
                onClick={handleDelete}
                className="p-2 text-red-500 hover:text-red-600 transition"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            )}

            <button
              disabled={sectionOrderIndex === 0}
              onClick={handlePrevious}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${sectionOrderIndex === 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
            >
              Previous
            </button>

            <button
              disabled={sectionOrderIndex === sectionLength - 1}
              onClick={handleNext}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${sectionOrderIndex === sectionLength - 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
                }`}
            >
              Next
            </button>

          </div>
        </div>
      </div>
      {/* <TicketDetailsDrawer
        handleCardDetails={handleCardDetails}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        todoList={todoList}
        taskInfoId={taskInfoId}
        // title={title}
        // description={description}
        progress={progress}
        assignee={AssignUserId}
        onUpdate={onUpdate}
      /> */}
    </>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  AssignUser: PropTypes.string,
  AssignUserId: PropTypes.string,
  handleDisable: PropTypes.number,
  handleDelete: PropTypes.func,
  onDragStart: PropTypes.func,
  handlePrevious: PropTypes.func,
  handleNext: PropTypes.func,
  onUpdate: PropTypes.func,
};

export default Card;