# frozen_string_literal: true

FactoryBot.define do
  factory :sprint do
    sequence(:name) { |n| "Sprint #{n}" }
    status { :planned }
    association :workspace
  end
end
