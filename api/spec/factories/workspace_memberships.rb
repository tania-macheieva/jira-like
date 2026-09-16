# frozen_string_literal: true

FactoryBot.define do
  factory :workspace_membership do
    association :user
    association :workspace
    role { :member }
  end
end
