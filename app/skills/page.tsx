"use client";

import { useState, useEffect } from "react";
import { skillsAPI, userSkillsAPI } from "@/lib/api";
import { getErrorMessage, getSuccessMessage } from "@/lib/errorHandler";

interface Skill {
  id: number;
  name: string;
  status: boolean;
}

interface UserSkill {
  id: number;
  skill_id: number;
  proficiency_level: string;
  skill_name: Skill;
}

export default function SkillsPage() {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
  const [customSkillName, setCustomSkillName] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [proficiencyLevel, setProficiencyLevel] = useState("beginner");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [skillsRes, userSkillsRes] = await Promise.all([
        skillsAPI.list(),
        userSkillsAPI.list(),
      ]);
      console.warn(userSkillsRes);
      console.warn(skillsRes);
      setAllSkills((skillsRes.data as { data?: Skill[] })?.data || []);
      setUserSkills((userSkillsRes.data as { data?: UserSkill[] })?.data || []);
    } catch (err) {
      console.warn(err);
      setError("Failed to load skills");
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!isCreatingNew && !selectedSkill) {
      setError("Please select a skill");
      return;
    }
    if (isCreatingNew && !customSkillName.trim()) {
      setError("Please enter a skill name");
      return;
    }

    try {
      if (isCreatingNew) {
        // Create new skill using skill_name
        await userSkillsAPI.addSingle({
          skill_name: customSkillName.trim(),
          proficiency_level: proficiencyLevel,
        });
        setCustomSkillName("");
        setSuccess(
          `Skill "${customSkillName}" created and added successfully!`
        );
      } else {
        // Add existing skill using skill_id
        await userSkillsAPI.addSingle({
          skill_id: selectedSkill!,
          proficiency_level: proficiencyLevel,
        });
        setSelectedSkill(null);
        setSuccess("Skill added successfully!");
      }

      setProficiencyLevel("beginner");
      setTimeout(() => setSuccess(""), 3000);
      fetchData();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteSkill = async (id: number) => {
    if (!confirm("Are you sure you want to remove this skill?")) return;

    try {
      await userSkillsAPI.delete(id);
      setSuccess("Skill removed successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const availableSkills = allSkills.filter(
    (skill) => !userSkills.some((us) => us.skill_id === skill.id)
  );
  const getProficiencyColor = (level: string) => {
    switch (level) {
      case "expert":
        return "badge-success";
      case "intermediate":
        return "badge-warning";
      default:
        return "badge-primary";
    }
  };

  const getProficiencyIcon = (level: string) => {
    switch (level) {
      case "expert":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        );
      case "intermediate":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Skills Management
        </h1>
        <p className="text-gray-600">
          Add and manage your professional skills and expertise
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error mb-6">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-6">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {/* Add Skill Form */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New Skill
        </h2>

        {/* Toggle between select existing or create new */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              setIsCreatingNew(false);
              setCustomSkillName("");
              setError("");
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              !isCreatingNew
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <svg
              className="w-5 h-5 inline mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Select Existing Skill
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCreatingNew(true);
              setSelectedSkill(null);
              setError("");
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              isCreatingNew
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <svg
              className="w-5 h-5 inline mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Skill
          </button>
        </div>

        <form
          onSubmit={handleAddSkill}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1">
            {isCreatingNew ? (
              <input
                type="text"
                value={customSkillName}
                onChange={(e) => setCustomSkillName(e.target.value)}
                className="input-field"
                placeholder="Enter new skill name (e.g., Next.js, Docker, GraphQL)"
                required
              />
            ) : (
              <select
                value={selectedSkill || ""}
                onChange={(e) => setSelectedSkill(Number(e.target.value))}
                className="input-field"
                required
              >
                <option value="">Select a skill</option>
                {availableSkills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="md:w-48">
            <select
              value={proficiencyLevel}
              onChange={(e) => setProficiencyLevel(e.target.value)}
              className="input-field"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <button type="submit" className="btn-primary whitespace-nowrap">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {isCreatingNew ? "Create & Add" : "Add Skill"}
          </button>
        </form>
      </div>

      {/* Skills Grid */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Your Skills ({userSkills.length})
        </h2>
        {userSkills.length === 0 ? (
          <div className="card p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <p className="text-gray-500 text-lg mb-2">No skills added yet</p>
            <p className="text-gray-400">
              Start building your skill portfolio by adding your first skill
              above
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSkills.map((userSkill) => {
              console.warn(userSkill);
              const skillName = userSkill.skill_name || "Unknown Skill";
              return (
                <div
                  key={userSkill.id}
                  className="card p-5 hover:scale-105 transition-transform"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="text-blue-600">
                        {getProficiencyIcon(userSkill.proficiency_level)}
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {skillName}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleDeleteSkill(userSkill.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove skill"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <span
                    className={`badge ${getProficiencyColor(
                      userSkill.proficiency_level
                    )} capitalize`}
                  >
                    {userSkill.proficiency_level}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pro Tip */}
      <div className="card p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-xl flex-shrink-0">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Pro Tip
            </h3>
            <p className="text-gray-700">
              Adding relevant skills helps the AI generate more targeted and
              convincing proposals. Be honest about your proficiency levels to
              ensure accurate representations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
