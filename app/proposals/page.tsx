'use client';

import { useState, useEffect } from 'react';
import { proposalsAPI } from '@/lib/api';
import { getErrorMessage, getSuccessMessage } from '@/lib/errorHandler';

interface Proposal {
  id: number;
  job_description: string;
  generated_proposal: string;
  provider: string;
  success_feedback: boolean | null;
  created_at: string;
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);

  const [jobDescription, setJobDescription] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'claude' | 'openai'>('gemini');
  const [generatedProposal, setGeneratedProposal] = useState('');

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await proposalsAPI.list();
      setProposals((response.data as { data?: Proposal[] })?.data || []);
    } catch (err) {
      setError('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGenerating(true);
    setGeneratedProposal('');

    try {
      const response = await proposalsAPI.generate({
        job_description: jobDescription,
        provider,
      });
      const proposalText = (response.data as { data?: { generated_proposal?: string } })?.data?.generated_proposal || '';
      setGeneratedProposal(proposalText);
      setSuccess('Proposal generated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchProposals();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleFeedback = async (proposalId: number, success: boolean) => {
    try {
      await proposalsAPI.submitFeedback(proposalId, { success });
      setSuccess(`Feedback submitted: ${success ? 'Success' : 'Failed'}`);
      setTimeout(() => setSuccess(''), 3000);
      fetchProposals();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const resetForm = () => {
    setJobDescription('');
    setProvider('gemini');
    setGeneratedProposal('');
    setShowGenerator(false);
  };

  const getProviderIcon = (providerName: string) => {
    switch (providerName) {
      case 'gemini':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
        );
      case 'claude':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        );
    }
  };

  const getProviderColor = (providerName: string) => {
    switch (providerName) {
      case 'gemini':
        return 'badge-primary';
      case 'claude':
        return 'badge-warning';
      case 'openai':
        return 'badge-success';
      default:
        return 'badge-primary';
    }
  };

  const providers = [
    {
      value: 'gemini',
      name: 'Google Gemini',
      description: 'Fast & cost-effective (Default)',
      color: 'from-blue-500 to-cyan-500',
      icon: '🔮',
    },
    {
      value: 'claude',
      name: 'Anthropic Claude',
      description: 'Best for detailed proposals',
      color: 'from-orange-500 to-amber-500',
      icon: '🧠',
    },
    {
      value: 'openai',
      name: 'OpenAI GPT',
      description: 'Creative & versatile',
      color: 'from-green-500 to-emerald-500',
      icon: '✨',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Proposals</h1>
          <p className="text-gray-600">Generate winning proposals with AI assistance</p>
        </div>
        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className={showGenerator ? 'btn-outline' : 'btn-primary'}
        >
          {showGenerator ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Generate New Proposal
            </>
          )}
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error mb-6">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-6">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {/* Generator Form */}
      {showGenerator && (
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Generate AI-Powered Proposal
          </h2>

          <form onSubmit={handleGenerate} className="space-y-6">
            {/* AI Provider Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Choose AI Provider
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {providers.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setProvider(p.value as typeof provider)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                      provider === p.value
                        ? 'border-blue-600 bg-blue-50 shadow-md scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{p.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{p.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{p.description}</p>
                      </div>
                      {provider === p.value && (
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={10}
                className="input-field"
                placeholder="Paste the complete job description here... Include requirements, responsibilities, qualifications, and any other relevant details."
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Tip: Include as much detail as possible for better AI-generated proposals
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={generating}
                className="btn-primary flex-1"
              >
                {generating ? (
                  <>
                    <div className="spinner border-2 border-white border-t-transparent w-5 h-5"></div>
                    Generating with {providers.find(p => p.value === provider)?.name}...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Proposal
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-outline px-8"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Generated Proposal Display */}
          {generatedProposal && (
            <div className="mt-8 border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Generated Proposal
                </h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedProposal);
                    setSuccess('Proposal copied to clipboard!');
                    setTimeout(() => setSuccess(''), 3000);
                  }}
                  className="btn-secondary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy to Clipboard
                </button>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-blue-200 rounded-xl p-6 whitespace-pre-wrap text-gray-800 leading-relaxed">
                {generatedProposal}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Proposal History */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Proposal History ({proposals.length})</h2>
        {proposals.length === 0 ? (
          <div className="card p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg mb-2">No proposals yet</p>
            <p className="text-gray-400 mb-4">Generate your first AI-powered proposal to get started</p>
            <button
              onClick={() => setShowGenerator(true)}
              className="btn-primary inline-flex mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create First Proposal
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="card p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(proposal.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className={`badge ${getProviderColor(proposal.provider)} capitalize flex items-center gap-1`}>
                        {getProviderIcon(proposal.provider)}
                        {proposal.provider}
                      </span>
                      {proposal.success_feedback !== null && (
                        <span
                          className={`badge ${
                            proposal.success_feedback ? 'badge-success' : 'badge-danger'
                          }`}
                        >
                          {proposal.success_feedback ? '✓ Success' : '✗ Failed'}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Job Description
                    </h3>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3 bg-gray-50 p-3 rounded-lg">
                      {proposal.job_description}
                    </p>
                    
                    <details className="mb-4">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Generated Proposal
                      </summary>
                      <div className="mt-4 bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-blue-100 rounded-xl p-5 whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                        {proposal.generated_proposal}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(proposal.generated_proposal);
                          setSuccess('Proposal copied to clipboard!');
                          setTimeout(() => setSuccess(''), 3000);
                        }}
                        className="mt-3 btn-outline text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy This Proposal
                      </button>
                    </details>
                    
                    {proposal.success_feedback === null && (
                      <div className="flex gap-3 pt-3 border-t">
                        <button
                          onClick={() => handleFeedback(proposal.id, true)}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          Mark as Successful
                        </button>
                        <button
                          onClick={() => handleFeedback(proposal.id, false)}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                          </svg>
                          Mark as Failed
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
