# frozen_string_literal: true

require 'rails_helper'

RSpec.describe IssueQuery do
  let!(:workspace) { FactoryBot.create(:workspace) }
  let!(:epic) { FactoryBot.create(:epic, workspace: workspace) }
  let!(:assignee) { FactoryBot.create(:user) }
  let!(:matching_issue) do
    FactoryBot.create(
      :issue,
      workspace: workspace,
      epic: epic,
      assignee: assignee,
      status: :in_progress,
      issue_type: :bug
    )
  end
  let!(:other_issue) do
    FactoryBot.create(
      :issue,
      workspace: workspace,
      status: :done,
      issue_type: :task
    )
  end

  it 'applies all supported filters' do
    result = described_class.new(
      Issue.where(workspace: workspace),
      status: 'in_progress',
      issue_type: 'bug',
      assignee_id: assignee.id,
      epic_id: epic.id
    ).call

    expect(result).to contain_exactly(matching_issue)
  end

  it 'ignores blank and unsupported filters' do
    result = described_class.new(
      Issue.where(workspace: workspace),
      status: '',
      issue_type: nil,
      assignee_id: ' ',
      ignored: other_issue.id
    ).call

    expect(result).to contain_exactly(matching_issue, other_issue)
  end
end
