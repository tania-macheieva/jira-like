# frozen_string_literal: true

class Workspace < ApplicationRecord
  has_many :workspace_memberships, dependent: :destroy
  has_many :users, through: :workspace_memberships

  has_many :epics, dependent: :destroy
  has_many :issues, dependent: :destroy
  has_many :sprints, dependent: :destroy

  validates :name, presence: true
  validates :key, presence: true, uniqueness: true
end
