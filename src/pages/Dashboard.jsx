import React, { useEffect, useState } from "react";
import Tasks from "./Tasks";
import AiChatBot from "../components/modals/AiChatBot";
import Loader from "../components/common/Loader";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "../store/slices/userSlice";
import { fetchTodos } from "../store/slices/todoSlice";
import { fetchSections } from "../store/slices/sectionsSlice";
import ChatBotWrapper from "../components/ChatBotWrapper";

const Dashboard = () => {
  const [userID, setUserID] = useState(null);
  const [isChatBotOpen, setIsChatBotOpen] = useState(true);

  const { isLoading, todoList } = useSelector((state) => state.todos);
  const sections = useSelector((state) => state.sections);
  const { isLoading: isUsersLoading, userList, currentUserData } = useSelector(
    (state) => state.users
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (userID) {
      dispatch(fetchTodos());
    }
  }, [userID, dispatch]);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchSections());
  }, [sections.sections.length, todoList, dispatch]);

  const isPageLoading = isLoading && isUsersLoading;

  return (
    <div className="flex w-full h-[calc(100vh-68px)] overflow-hidden">
      <div
        className={`
          flex-1
          overflow-y-auto
          transition-all duration-300 ease-in-out
          ${isChatBotOpen ? "lg:w-[75%]" : "w-full"}
        `}
      >
        {isPageLoading ? (
          <Loader />
        ) : (
          <Tasks
            setUserID={setUserID}
            userID={userID}
            sections={sections}
            todoList={todoList}
            userList={userList}
            currentUserData={currentUserData}
            setIsChatBotOpen={setIsChatBotOpen}
            isChatBotOpen={isChatBotOpen}
          />
        )}
      </div>

      {isChatBotOpen && (
        <div

        >
          <div className="w-full h-full flex flex-col">
            <ChatBotWrapper setIsChatBotOpen={setIsChatBotOpen} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
