# frozen_string_literal: true

class Sprint < ApplicationRecord
  belongs_to :workspace
  has_many :issues, dependent: :nullify

  enum :status, { planned: 0, active: 1, completed: 2 }

  validates :name, presence: true
end
