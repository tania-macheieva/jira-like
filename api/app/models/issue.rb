# frozen_string_literal: true

class Issue < ApplicationRecord
  belongs_to :workspace
  belongs_to :epic, optional: true
  belongs_to :sprint, optional: true

  belongs_to :assignee, class_name: 'User', optional: true
  belongs_to :creator, class_name: 'User'

  has_many :comments, dependent: :destroy

  enum :status,
       {
         to_do: 0,
         in_progress: 1,
         review: 2,
         qa: 3,
         done: 4
       }

  enum :issue_type,
       {
         task: 0,
         bug: 1,
         story: 2,
         feature: 3
       }

  validates :title, presence: true
  validates :status, presence: true
  validates :issue_type, presence: true

  validate :epic_belongs_to_workspace
  validate :sprint_belongs_to_workspace

  private

  def epic_belongs_to_workspace
    return if epic.nil?
    return if epic.workspace_id == workspace_id

    errors.add(:epic, 'must belong to the same workspace as the issue')
  end

  def sprint_belongs_to_workspace
    return if sprint.nil?
    return if sprint.workspace_id == workspace_id

    errors.add(:sprint, 'must belong to the same workspace as the issue')
  end
end
