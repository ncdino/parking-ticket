import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

const Tab = ({ item, onClick, isSelected }) => {
  return (
    <motion.button
      key={item.id}
      onClick={onClick}
      className={`py-2 px-4 rounded-lg ${
        isSelected ? "bg-blue-500 text-white" : "bg-gray-200"
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.15 },
      }}
      exit={{
        opacity: 0,
        y: 20,
        transition: { duration: 0.3 },
      }}
    >
      {item.title}
    </motion.button>
  );
};

Tab.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Tab;
