import SwiftUI

struct ContentView: View {
    @State private var selected = 0
    private let sections = ["Discover", "Series", "Films", "My Universe"]
    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 42) {
                Text("STORYSPACE").font(.system(size: 48, weight: .bold, design: .rounded))
                Text("Find your next feeling").font(.largeTitle)
                HStack(spacing: 28) {
                    ForEach(sections.indices, id: \.self) { index in
                        Button(sections[index]) { selected = index }
                            .buttonStyle(.borderedProminent)
                            .tint(selected == index ? .teal : .gray)
                    }
                }
                Text("TV client starter · API and licensed playback integration pending").foregroundStyle(.secondary)
            }.padding(80)
        }
    }
}