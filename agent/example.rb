require_relative "./agent"

def main
  puts "0"
  sleep 1
  5.times do
    subroutine
    sleep 0.5
  end
  puts "1"
  sleep 1
end

def subroutine
  puts "a"
  3.times do
    sleep 0.1
    puts "b"
  end
  puts "c"
end

def dead_code
  # not called
end

Agent.run { main }
