# frozen_string_literal: true

FactoryBot.define do
  factory :epic do
    sequence(:name) { |n| "Epic #{n}" }
    association :workspace
  end
end
