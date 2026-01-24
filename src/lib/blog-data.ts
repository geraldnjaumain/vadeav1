export interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    content: string; // HTML or Markdown content
    category: string;
    date: string;
    slug: string;
    image: string; // URL for the cover image
    readTime: string;
    author: string;
    authorImage: string;
    claps?: string; // Optional claps count matching the design
}

export const blogPosts: BlogPost[] = [
    {
        id: 1,
        title: "The Rise of Competency-Based Learning in Kenya",
        excerpt: "Why the shift from 8-4-4 to CBC is transforming how our children think, create, and solve problems.",
        content: `
            <p>The education landscape in Kenya is undergoing a seismic shift. For decades, the 8-4-4 system prioritized rote memorization and exam ranking. While it produced graduates with strong theoretical knowledge, it often left them ill-equipped for the dynamic, practical demands of the modern workforce.</p>
            <br/>
            <h3>Enter CBC: A Paradigm Shift</h3>
            <p>The Competency-Based Curriculum (CBC) flips this model on its head. Instead of asking "What does this student know?", it asks "What can this student do?". This subtle change is revolutionary.</p>
            <br/>
            <p>At Vadea, we believe CBC is the key to unlocking Kenya's potential. By focusing on seven core competencies—Communication, Collaboration, Critical Thinking, Creativity, Citizenship, Digital Literacy, and Self-Efficacy—we are nurturing a generation of innovators, not just test-takers.</p>
            <br/>
            <h3>How Vadea Supports CBC</h3>
            <p>Our platform is built from the ground up to align with CBC designs. Our interactive lessons don't just lecture; they challenge students to apply concepts. Whether it's a Grade 4 science project on soil conservation or a Grade 6 digital literacy task, Vadea provides the tools for hands-on learning, even in a digital environment.</p>
        `,
        category: "Education",
        date: "Jan 18, 2026",
        slug: "cbc-transformation-kenya",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop",
        readTime: "5 min read",
        author: "Sarah Njoroge",
        authorImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        claps: "2.4K"
    },
    {
        id: 2,
        title: "Bridging the Gap: Offline Learning for Every Child",
        excerpt: "Internet access shouldn't determine a child's future. How Vadea's offline-first technology is democratizing education.",
        content: `
            <p>In many parts of Kenya, reliable high-speed internet is a luxury. Yet, talent is distributed equally. This digital divide threatens to leave millions of brilliant young minds behind. Vadea was founded on a simple promise: No child should be excluded from quality education due to connectivity issues.</p>
            <br/>
            <h3>The Offline-First Advantage</h3>
            <p>Our mobile application allows students to download entire strands and substrands when they have access to Wi-Fi. Once downloaded, the learning experience is seamless. Videos, quizzes, and interactive exercises work perfectly without a single kilobyte of data.</p>
            <br/>
            <p>When the device reconnects, all progress, scores, and finished assignments automatically sync to the cloud. This allows teachers and parents to track progress in real-time without requiring the student to be constantly online.</p>
        `,
        category: "Technology",
        date: "Jan 15, 2026",
        slug: "offline-learning-democratization",
        image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2000&auto=format&fit=crop",
        readTime: "4 min read",
        author: "David Kamau",
        authorImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        claps: "1.8K"
    },
    {
        id: 3,
        title: "Parenting in the Digital Age: Balancing Screen Time",
        excerpt: "Screens are powerful tools, but balance is key. Practical tips for parents to manage their child's digital wellbeing.",
        content: `
            <p>As we integrate more digital tools into education, parents often worry about excessive screen time. It's a valid concern. However, not all screen time is created equal.</p>
            <br/>
            <h3>Passive vs. Active Consumption</h3>
            <p>Passive consumption—mindlessly scrolling social media or watching cartoons—can be detrimental in large doses. Active consumption, on the other hand, involves engagement. Solving a math puzzle, coding a simple game, or writing a digital story on Vadea is active learning.</p>
            <br/>
            <p>We recommend a "Quality over Quantity" approach. Set designated "learning hours" where screens are used strictly for educational purposes. Use tools like Vadea's parent dashboard to monitor not just how long your child was online, but what they achieved during that time.</p>
        `,
        category: "Parenting",
        date: "Jan 10, 2026",
        slug: "balancing-screen-time",
        image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop",
        readTime: "6 min read",
        author: "Grace Omondi",
        authorImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace",
        claps: "3.2K"
    },
    {
        id: 4,
        title: "Empowering Teachers: The Vadea Classroom",
        excerpt: "How our tools reduce administrative burden and allow teachers to focus on what they do best: teaching.",
        content: `
            <p>Teachers are the backbone of our education system. Yet, they are often overwhelmed by administrative tasks—grading, attendance, reporting—leaving less time for personalized instruction.</p>
            <br/>
            <h3>Automating the Mundane</h3>
            <p>Vadea's Teacher Dashboard automates grading for quizzes and tracks student progress instantly. This frees up hours of time every week. Instead of marking papers late into the night, teachers can use that time to identify students who are struggling and provide targeted interventions.</p>
        `,
        category: "Community",
        date: "Jan 05, 2026",
        slug: "empowering-teachers",
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop",
        readTime: "3 min read",
        author: "Vadea Team",
        authorImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vadea",
        claps: "4.1K"
    }
];
