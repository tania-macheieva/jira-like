# frozen_string_literal: true

FactoryBot.define do
  factory :issue do
    sequence(:title) { |n| "Issue #{n}" }
    description { 'Issue description' }
    status { :to_do }
    issue_type { :task }
    association :workspace
    association :creator, factory: :user
    assignee { nil }

    epic { association(:epic, workspace: workspace) }
  end
end
