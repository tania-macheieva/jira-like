# frozen_string_literal: true

class Issue < ApplicationRecord
  belongs_to :workspace
  belongs_to :epic, optional: true

  belongs_to :assignee, class_name: 'User', optional: true
  belongs_to :creator, class_name: 'User'

  enum :status,
       {
         todo: 0,
         in_progress: 1,
         review: 2,
         qa: 3,
         done: 4
       }

  enum :type,
       {
         task: 0,
         bug: 1,
         story: 2,
         feature: 3
       }
end
