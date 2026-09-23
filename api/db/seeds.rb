# frozen_string_literal: true

Faker::Config.random = Random.new(42)

password = 'Password123!'

Workspace.where(key: %w[DEMO1 DEMO2 DEMO3]).destroy_all
User.where(email: (1..8).map { |index| "seed-user-#{index}@example.com" }).destroy_all

users = 8.times.map do |index|
  name = Faker::Name.name
  User.find_or_create_by!(email: "seed-user-#{index + 1}@example.com") do |user|
    user.name = name
    user.password = password
    user.password_confirmation = password
  end
end

workspaces = 3.times.map do |index|
  name = "#{Faker::Company.name} Workspace"
  Workspace.find_or_create_by!(key: "DEMO#{index + 1}") do |workspace|
    workspace.name = name
  end
end

# rubocop:disable-next Metrics/BlockLength
workspaces.each_with_index do |workspace, workspace_index|
  owner = users[workspace_index]

  WorkspaceMembership.find_or_create_by!(user: owner, workspace: workspace) do |membership|
    membership.role = :owner
  end

  users.drop(workspace_index + 1).first(4).each_with_index do |user, index|
    role = index.zero? ? :admin : :member
    WorkspaceMembership.find_or_create_by!(user: user, workspace: workspace) do |membership|
      membership.role = role
    end
  end

  epics = 2.times.map do
    name = Faker::Lorem.sentence(word_count: 3).delete_suffix('.')
    description = Faker::Lorem.paragraph
    Epic.find_or_create_by!(workspace: workspace, name: name) do |epic|
      epic.description = description
    end
  end

  sprint = Sprint.create!(workspace: workspace, name: 'Sprint 1', status: :active)

  8.times do
    creator = workspace.users.sample(random: Faker::Config.random)
    assignee = workspace.users.sample(random: Faker::Config.random)
    title = Faker::Lorem.sentence(word_count: 5).delete_suffix('.')
    epic = epics.sample(random: Faker::Config.random)
    description = Faker::Lorem.paragraph
    status = Issue.statuses.keys.sample(random: Faker::Config.random)
    issue_type = Issue.issue_types.keys.sample(random: Faker::Config.random)

    issue = Issue.find_or_create_by!(workspace: workspace, title: title) do |new_issue|
      new_issue.epic = epic
      new_issue.sprint = sprint
      new_issue.creator = creator
      new_issue.assignee = assignee
      new_issue.description = description
      new_issue.status = status
      new_issue.issue_type = issue_type
    end

    2.times do
      body = Faker::Lorem.sentence(word_count: 12).delete_suffix('.')
      comment_user = workspace.users.sample(random: Faker::Config.random)
      Comment.find_or_create_by!(issue: issue, body: body) do |comment|
        comment.user = comment_user
      end
    end
  end
end

puts "Created #{User.count} users, #{Workspace.count} workspaces, " \
     "#{WorkspaceMembership.count} memberships, #{Epic.count} epics, " \
     "#{Issue.count} issues, and #{Comment.count} comments."
puts "Seed user password: #{password}"
